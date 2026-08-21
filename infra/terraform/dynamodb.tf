resource "aws_dynamodb_table" "user_documents" {
  name         = "${local.name_prefix}-user-documents"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userEmail"

  attribute {
    name = "userEmail"
    type = "S"
  }

  point_in_time_recovery {
    enabled = false
  }
}
