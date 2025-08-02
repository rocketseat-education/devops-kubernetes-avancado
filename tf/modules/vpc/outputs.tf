output "vpc_id" {
  value = aws_vpc.networking_vpc.id
}

output "vpc_cidr_block" {
  value = aws_vpc.networking_vpc.cidr_block
}

output "public_subnet_ids" {
  value = aws_subnet.public_subnets[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private_subnets[*].id
}

output "internet_gateway_id" {
  value = aws_internet_gateway.networking_igw.id
}

output "nat_gateway_ids" {
  value = aws_nat_gateway.nat_gtw[*].id
}