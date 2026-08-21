# Infrastructure

Two stacks, split by lifetime rather than by service:

| | Owns | Why |
| --- | --- | --- |
| `terraform/` | S3 bucket, DynamoDB table, backend IAM policy | Stateful. Outlives any deploy, and destroying it means losing user data. |
| `serverless/` | 6 Lambdas, the Step Functions state machine, the EventBridge rule | The ingestion pipeline. Redeployed whenever handler code changes. |

Terraform never writes into `apps/` or `serverless/`; it manages AWS and
publishes outputs. Each consumer owns its own `.env`.

## Pipeline

```
browser --presigned PUT--> s3://.../uploads/{documentId}.pdf
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

## Setup

**1. Pinecone index** — create it in the console before deploying. Terraform
does not manage it.

- Dimension `1536`, metric `cosine`
- Name it to match `PINECONE_INDEX_NAME`

**2. AWS credentials**

```bash
aws configure --profile pdf-rag && export AWS_PROFILE=pdf-rag
```

**3. Terraform** — must run first; Serverless needs the bucket name.

```bash
cd infra/terraform && cp terraform.tfvars.example terraform.tfvars && terraform init && terraform apply
```

**4. Fill in the env files**

```bash
terraform -chdir=infra/terraform output -raw env_snippet
```

Paste that into both `apps/api/.env` and `infra/serverless/.env` (each has an
`.env.example` to copy first), then add your `OPENAI_API_KEY` and
`PINECONE_API_KEY` to both. One-time — those names only change if the bucket
is recreated.

**5. Deploy the pipeline**

```bash
cd infra/serverless && npm install && npx serverless login && npx serverless deploy
```

`serverless login` is a one-time browser flow. Framework v4 requires an
account; it is free below $2M revenue.

## The contract with the API

The pipeline learns who uploaded a file from S3 object metadata, so when the
API presigns the PUT it **must** set both:

| Metadata key | Value |
| --- | --- |
| `x-amz-meta-document-id` | uuid, also used for the `work/` prefix |
| `x-amz-meta-user-email` | the user's email, also the Pinecone namespace |

The API must also write the DynamoDB record with `status: "pending"` before
handing back the URL. The pipeline only ever updates — `update-status` uses a
`attribute_exists` condition, so a missing record fails loudly rather than
writing a half-formed item.

Key is `uploads/{documentId}.pdf`. Email stays out of the key because `+` and
unicode would need escaping.

## Embedding settings must match

`OPENAI_EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS` and `PINECONE_INDEX_NAME`
appear in both `apps/api/.env` and `infra/serverless/.env` and have to be
identical.

The pipeline embeds the document; the API embeds the user's question. Vectors
from different models occupy different spaces, so a mismatch does not raise an
error — Pinecone returns nearest neighbours that mean nothing and the bot
answers confidently from irrelevant passages. Change them together.

## Debugging

```bash
aws stepfunctions list-executions --state-machine-arn <arn> --status-filter FAILED
```

The console's graph view shows which step failed and its input. Handler logs
are in `/aws/lambda/pdf-rag-ingestion-{stage}-{function}`, retained 14 days.

A document stuck on `processing` means the pipeline died without reaching
`update-error` — check the execution history first.

## Teardown

```bash
cd infra/serverless && npx serverless remove
cd infra/terraform && terraform destroy
```

Serverless first: its EventBridge rule references the bucket Terraform owns.
The bucket must be emptied before `destroy` succeeds.
