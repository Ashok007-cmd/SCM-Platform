# ============================================================
# SCM Platform — AWS Infrastructure (Terraform)
# Provisions: VPC, EKS Cluster, RDS PostgreSQL, ElastiCache
# ============================================================

terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }

  # Remote state stored in S3 (Phase 2 plan requirement)
  backend "s3" {
    bucket         = "scm-platform-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "scm-platform-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC ─────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_dns_hostnames   = true

  tags = local.common_tags

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"                           = "1"
    "kubernetes.io/cluster/${var.project_name}-eks"            = "owned"
  }
  public_subnet_tags = {
    "kubernetes.io/role/elb"                                    = "1"
    "kubernetes.io/cluster/${var.project_name}-eks"            = "owned"
  }
}

# ─── EKS Cluster ─────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-eks"
  cluster_version = "1.29"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      min_size       = 2
      max_size       = 6
      desired_size   = 3
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
    spot = {
      min_size       = 1
      max_size       = 4
      desired_size   = 2
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "SPOT"
    }
  }

  tags = local.common_tags
}

# ─── RDS PostgreSQL ──────────────────────────────────────────
resource "aws_db_subnet_group" "scm" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
  tags       = local.common_tags
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-postgres"
  engine                 = "postgres"
  engine_version         = "16.2"
  instance_class         = "db.t3.medium"
  allocated_storage      = 100
  max_allocated_storage  = 500
  storage_encrypted      = true

  db_name  = "scmdb"
  username = "scmuser"
  password = var.db_postgres_password

  db_subnet_group_name   = aws_db_subnet_group.scm.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = true
  backup_retention_period = 7
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.project_name}-postgres-final"

  tags = local.common_tags
}

# ─── ElastiCache Redis ───────────────────────────────────────
resource "aws_elasticache_subnet_group" "scm" {
  name       = "${var.project_name}-cache-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project_name}-redis"
  description          = "SCM Platform Redis Cache"
  node_type            = "cache.t3.micro"
  num_cache_clusters   = 2
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.scm.name
  security_group_ids   = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  tags                 = local.common_tags
}

# ─── Security Groups ─────────────────────────────────────────
resource "aws_security_group" "rds" {
  name   = "${var.project_name}-rds-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }
  tags = local.common_tags
}

resource "aws_security_group" "redis" {
  name   = "${var.project_name}-redis-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }
  tags = local.common_tags
}

# ─── Locals ──────────────────────────────────────────────────
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "scm-engineering"
  }
}
