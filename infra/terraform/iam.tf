data "aws_iam_policy_document" "backend" {
  statement {
    sid       = "ManageUserUploads"
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.documents.arn}/uploads/*"]
  }

  statement {
    sid = "ManageDocumentRecords"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
    ]

    resources = [aws_dynamodb_table.user_documents.arn]
  }
}

resource "aws_iam_policy" "backend" {
  name        = "${local.name_prefix}-backend"
  description = "Presign uploads and manage document records. Attach to the NestJS API's role."
  policy      = data.aws_iam_policy_document.backend.json
}
