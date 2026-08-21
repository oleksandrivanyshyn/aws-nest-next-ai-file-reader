locals {
  serverless_env_path = abspath("${path.module}/../serverless/.env")
  api_env_path        = abspath("${path.module}/../../apps/api/.env")
}

output "s3_bucket_name" {
  description = "Bucket holding uploaded PDFs and pipeline artefacts."
  value       = aws_s3_bucket.documents.bucket
}

output "dynamodb_table_name" {
  description = "Table tracking each user's document and ingestion status."
  value       = aws_dynamodb_table.user_documents.name
}

output "backend_policy_arn" {
  description = "Attach to the NestJS API's execution role when deploying it."
  value       = aws_iam_policy.backend.arn
}

output "env_snippet" {
  description = "Paste into apps/api/.env and infra/serverless/.env."

  value = <<-EOT
    AWS_REGION=${var.aws_region}
    S3_BUCKET_NAME=${aws_s3_bucket.documents.bucket}
    DYNAMODB_TABLE_NAME=${aws_dynamodb_table.user_documents.name}
  EOT
}

resource "terraform_data" "sync_env_files" {
  triggers_replace = [
    aws_s3_bucket.documents.bucket,
    aws_dynamodb_table.user_documents.name,
    var.aws_region,
  ]

  provisioner "local-exec" {
    command = <<-EOT
      node -e "
        const fs = require('fs');
        const paths = ['${local.api_env_path}', '${local.serverless_env_path}'];
        const updates = {
          AWS_REGION: '${var.aws_region}',
          S3_BUCKET_NAME: '${aws_s3_bucket.documents.bucket}',
          DYNAMODB_TABLE_NAME: '${aws_dynamodb_table.user_documents.name}',
        };

        for (const p of paths) {
          let content = '';
          if (fs.existsSync(p)) {
            content = fs.readFileSync(p, 'utf8');
          } else {
            const examplePath = p.endsWith('.env') ? p + '.example' : p;
            if (fs.existsSync(examplePath)) {
              content = fs.readFileSync(examplePath, 'utf8');
            }
          }

          for (const [key, val] of Object.entries(updates)) {
            const regex = new RegExp('^' + key + '=.*$', 'm');
            if (regex.test(content)) {
              content = content.replace(regex, key + '=' + val);
            } else {
              content += '\n' + key + '=' + val;
            }
          }

          fs.writeFileSync(p, content.trim() + '\n', 'utf8');
          console.log('Synchronized AWS config into ' + p);
        }
      "
    EOT
  }
}
