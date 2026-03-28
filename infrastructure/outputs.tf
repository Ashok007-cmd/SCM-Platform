# ============================================================
# SCM Platform — Terraform Outputs
# ============================================================

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint URL for the EKS cluster API server"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_certificate" {
  description = "Base64-encoded certificate for EKS cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "vpc_id" {
  description = "ID of the provisioned VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnets
}

output "rds_endpoint" {
  description = "RDS PostgreSQL connection endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.postgres.port
}

output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "kubeconfig_command" {
  description = "AWS CLI command to update local kubeconfig for EKS access"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
