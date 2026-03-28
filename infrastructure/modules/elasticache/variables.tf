variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "eks_security_group_id" { type = string }

variable "node_type" {
  description = "ElastiCache node type"
  type        = string
}

variable "num_cache_nodes" {
  description = "Number of cache nodes (>=2 enables Multi-AZ)"
  type        = number
  default     = 2
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.2"
}
