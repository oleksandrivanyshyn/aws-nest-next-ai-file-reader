variable "aws_region" {
  description = "Region every resource is created in."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix for all resource names."
  type        = string
  default     = "pdf-rag"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "cors_allowed_origins" {
  description = "Origins allowed to PUT to S3 via presigned URL. The Next.js app."
  type        = list(string)
  default     = ["http://localhost:3000"]
}
