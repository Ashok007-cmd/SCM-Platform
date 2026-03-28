output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.this.id
}

output "private_subnet_ids" {
  description = "IDs of all private subnets"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "IDs of all public subnets"
  value       = aws_subnet.public[*].id
}

output "nat_gateway_ids" {
  description = "IDs of the NAT Gateways"
  value       = aws_nat_gateway.this[*].id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.this.cidr_block
}
