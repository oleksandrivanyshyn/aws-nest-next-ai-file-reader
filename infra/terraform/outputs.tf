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

output "ec2_instance_id" {
  description = "Connect with: aws ssm start-session --target <this>."
  value       = aws_instance.backend.id
}

output "ec2_public_ip" {
  description = "The backend's Elastic IP. Not meant to be hit directly -- traffic should go through CloudFront."
  value       = aws_eip.backend.public_ip
}

output "cloudfront_domain_name" {
  description = "Public HTTPS endpoint for the backend API."
  value       = aws_cloudfront_distribution.backend.domain_name
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
    command = "node ${path.module}/scripts/sync-env.js"

    environment = {
      API_ENV_PATH        = local.api_env_path
      SERVERLESS_ENV_PATH = local.serverless_env_path
      AWS_REGION          = var.aws_region
      S3_BUCKET_NAME      = aws_s3_bucket.documents.bucket
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.user_documents.name
    }
  }
}
