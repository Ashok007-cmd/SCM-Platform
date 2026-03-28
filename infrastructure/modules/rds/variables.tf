variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "eks_security_group_id" { type = string }
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }
variable "max_allocated_storage" { type = number }
variable "engine_version" { type = string }
variable "db_name" { type = string }
variable "username" { type = string }
variable "password" { type = string; sensitive = true }
variable "multi_az" { type = bool; default = true }
variable "backup_retention_days" { type = number; default = 7 }
