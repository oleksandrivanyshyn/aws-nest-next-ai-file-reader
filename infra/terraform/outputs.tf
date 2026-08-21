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
