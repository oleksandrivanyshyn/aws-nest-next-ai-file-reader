# Infrastructure

Two pieces, split by lifetime:

| | Owns | Why |
| --- | --- | --- |
| `terraform/` | S3 bucket, DynamoDB table, EC2 instance, CloudFront, IAM | Stateful. Outlives any deploy, and destroying it means losing user data. |
| `serverless/` | 6 Lambdas, the Step Functions state machine, the EventBridge rule | The ingestion pipeline. Redeployed whenever handler code changes. |

Terraform never writes into `apps/` or `serverless/` source; it manages AWS
and publishes outputs. The one exception is `.env` files — see step 4 below.
How the API is (re)started on the EC2 instance is owned by
`.github/workflows/deploy-api.yml`, not by Terraform.

## Pipeline

```
browser --presigned PUT--> s3://.../uploads/{userEmail}/{documentId}.pdf
                                    |
                            EventBridge (prefix: uploads/)
                                    |
                          Step Functions execution
                                    |
   ExtractText -> ChunkText -> EmbedChunks -> IndexChunks -> UpdateStatusSuccess
        |             |             |             |
        +-------------+-------------+-------------+--> UpdateStatusError
```

Steps pass **S3 keys, not data**. A Step Functions state payload is capped at
256KB and one document's embeddings run to megabytes, so each step writes to
`work/{documentId}/` and returns the key. Those artefacts expire after a day
via a lifecycle rule.

The EventBridge rule filters on the `uploads/` prefix. That filter is
load-bearing: the pipeline writes back into the same bucket, and without it
those writes would retrigger the pipeline forever.

## Backend deploy

```
GitHub push (main) --> self-hosted runner on EC2 --> docker build && docker run
                                                              |
      https://d123.cloudfront.net  <--  CloudFront  <--  container :5000
```

No `docker-compose.yml` — one container doesn't need an orchestrator. Config
comes from the repo's GitHub Actions secrets and variables (Settings →
Secrets and variables → Actions), not from a file that lives on the instance.
The workflow writes them into a fresh `$RUNNER_TEMP/apps-api.env` on every
run, passes it to `docker run --env-file`, then deletes it. This sidesteps a
real trap: `actions/checkout`'s default `clean: true` runs `git clean -ffdx`,
which deletes gitignored files (including any `.env` sitting in the checkout)
before every run — a static file would get wiped the moment you tried to rely
on it surviving between deploys. Regenerating fresh from GitHub every time
means there's nothing on disk to get wiped, and rotating a secret is just
`gh secret set NAME` followed by a redeploy, no SSM session required.

CloudFront terminates HTTPS on its default `*.cloudfront.net` domain and
proxies to the instance over plain HTTP inside AWS's network — no ALB, no ACM
certificate to manage. The instance's security group only accepts inbound
traffic from CloudFront's managed prefix list, so the API is unreachable
except through CloudFront. There is no SSH: the instance role only grants SSM,
so shell access goes through Session Manager.

The GitHub Actions runner lives on the EC2 instance itself and polls GitHub —
no inbound access needed for it either. The deploy workflow triggers only on
`push` to `main`, never on `pull_request`. That matters specifically because
this repo is public: a self-hosted runner wired to `pull_request` would let
anyone's fork run code on your instance by opening a PR.

## Setup

**1. Pinecone index** — create it in the console before deploying. Terraform
does not manage it.

- Dimension `1536`, metric `cosine`
- Name it to match `PINECONE_INDEX_NAME`

**2. AWS credentials**

```bash
aws configure --profile pdf-rag && export AWS_PROFILE=pdf-rag
```

**3. Terraform**

```bash
cd infra/terraform && cp terraform.tfvars.example terraform.tfvars && terraform init && terraform apply
```

This also creates the EC2 instance and CloudFront distribution. CloudFront
takes several minutes to fully propagate after `apply` returns.

**4. Add your API keys**

`apply` already wrote `AWS_REGION`, `S3_BUCKET_NAME` and `DYNAMODB_TABLE_NAME`
into both `apps/api/.env` and `infra/serverless/.env` (creating them from
`.env.example` if they didn't exist yet). Open both and add the two values
Terraform can't know:

```
GEMINI_API_KEY=
PINECONE_API_KEY=
```

Re-running `apply` later only touches the three infra lines — your keys are
untouched.

**5. Deploy the pipeline**

```bash
cd infra/serverless && npm install && npx serverless login && npx serverless deploy
```

`serverless login` is a one-time browser flow. Framework v4 requires an
account; it is free below $2M revenue.

**6. Register the GitHub Actions runner**

Connect without SSH:

```bash
aws ssm start-session --target "$(terraform -chdir=infra/terraform output -raw ec2_instance_id)"
```

SSM drops you in as `ssm-user`, which isn't in the `docker` group — only
`ubuntu` is (see `user-data.sh`). Switch before doing anything else, so the
runner service ends up running as a user that can actually reach the Docker
socket:

```bash
sudo su - ubuntu
```

The deployed container's config comes from the repo's GitHub Actions secrets
and variables, not from a file on this instance — set those once from your
own machine (not this SSM session), before or after registering the runner:

```bash
gh variable set CORS_ORIGINS --body "http://localhost:3000,https://your-frontend.vercel.app"
gh variable set AWS_REGION --body "us-east-1"
gh variable set S3_BUCKET_NAME --body "$(terraform -chdir=infra/terraform output -raw s3_bucket_name)"
gh variable set DYNAMODB_TABLE_NAME --body "$(terraform -chdir=infra/terraform output -raw dynamodb_table_name)"
gh variable set GEMINI_EMBEDDING_MODEL --body "gemini-embedding-2"
gh variable set EMBEDDING_DIMENSIONS --body "1536"
gh variable set PINECONE_INDEX_NAME --body "pdf-rag-index"
gh variable set GEMINI_CHAT_MODEL --body "gemini-flash-lite-latest"
gh secret set GEMINI_API_KEY
gh secret set PINECONE_API_KEY
```

(`gh secret set NAME` with no `--body` prompts for the value, or reads it
from stdin — never put a secret directly on a command line.)

Back on the instance: generate a **fresh** registration token from
`github.com/<you>/<repo>/settings/actions/runners/new` — it expires in about
an hour and is a bearer credential, so don't reuse one from a chat log or
paste it anywhere it'll be recorded:

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64-2.336.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.336.0/actions-runner-linux-x64-2.336.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.336.0.tar.gz
./config.sh --url https://github.com/<you>/<repo> --token <fresh-token> --name ec2-backend-runner --labels self-hosted,linux,x64 --unattended
sudo ./svc.sh install
sudo ./svc.sh start
```

**7. Ship it**

```bash
git push origin main
```

The workflow builds the API's Docker image on the instance and restarts the
container. Watch it under the repo's Actions tab, or from the instance with
`docker logs -f pdf-rag-api`.

## The contract with the API

The pipeline learns who uploaded a file, and its id, entirely from the S3 key
— no object metadata involved. The API must upload to:

```
uploads/{userEmail}/{documentId}.pdf
```

`extract-text` parses this back out with `decodeURIComponent`, which is also
why the raw key can safely contain `@` and `+` — S3 event notifications
percent-encode the key, and `decodeURIComponent` reverses it.

The API must also write the DynamoDB record with `status: "PENDING"` before
handing back the presigned URL. The pipeline only ever updates — `updateStatus`
uses an `attribute_exists` condition, so a missing record fails loudly rather
than the pipeline writing a half-formed item. Status values are
`PENDING | PROCESSING | SUCCESS | ERROR`.

## Embedding settings must match

`GEMINI_EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS` and `PINECONE_INDEX_NAME`
appear in both `apps/api/.env` and `infra/serverless/.env` and have to be
identical.

The pipeline embeds the document; the API embeds the user's question. Vectors
from different models occupy different spaces, so a mismatch does not raise an
error — Pinecone returns nearest neighbours that mean nothing and the bot
answers confidently from irrelevant passages. Change them together.

## Debugging

**Pipeline:**

```bash
aws stepfunctions list-executions --state-machine-arn <arn> --status-filter FAILED
```

The console's graph view shows which step failed and its input. Handler logs
are in `/aws/lambda/pdf-rag-ingestion-{stage}-{function}`, retained 14 days.

A document stuck on `PROCESSING` means the pipeline died without reaching
`UpdateStatusError` — check the execution history first.

**Backend:**

```bash
aws ssm start-session --target <instance-id>
docker logs -f pdf-rag-api
```

If CloudFront returns 502/504, the container is most likely not listening on
port 5000 — check the repo's Settings → Secrets and variables → Actions for
what actually got baked into the last deploy, and `docker logs pdf-rag-api`
on the instance for why it didn't come up.

## Teardown

```bash
cd infra/serverless && npx serverless remove
cd infra/terraform && terraform destroy
```

Serverless first: its EventBridge rule references the bucket Terraform owns.
The bucket must be emptied before `destroy` succeeds. `destroy` also
terminates the EC2 instance and the runner registered on it — remove the
runner from the repo's settings afterward, since a terminated instance leaves
it listed as offline rather than deregistering it.
