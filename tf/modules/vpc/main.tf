resource "aws_vpc" "networking_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.vpc_name}-vpc"
    IAC  = "True"
  }
}

resource "aws_internet_gateway" "networking_igw" {
  vpc_id = aws_vpc.networking_vpc.id

  tags = {
    Name = "${var.vpc_name}-igw"
    IAC  = "True"
  }
}

resource "aws_eip" "nat_eip" {
  domain = "vpc"

  depends_on = [aws_internet_gateway.networking_igw]

  tags = {
    Name = "${var.vpc_name}-nat-eip"
    IAC  = "True"
  }
}

resource "aws_subnet" "public_subnets" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.networking_vpc.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-${count.index + 1}"
    IAC  = "True"
  }
}

resource "aws_subnet" "private_subnets" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.networking_vpc.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
    IAC  = "True"
  }
}

resource "aws_nat_gateway" "nat_gtw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnets[0].id

  depends_on = [aws_internet_gateway.networking_igw]

  tags = {
    Name = "nat-gtw"
    IAC  = "True"
  }
}

resource "aws_route_table" "public_rtb" {
  vpc_id = aws_vpc.networking_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.networking_igw.id
  }

  tags = {
    Name = "public-rtb"
    IAC  = "True"
  }
}

resource "aws_route_table" "private_rtb" {
  vpc_id = aws_vpc.networking_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gtw.id
  }

  tags = {
    Name = "private-rtb"
    IAC  = "True"
  }
}

resource "aws_route_table_association" "association_public_rta" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rtb.id
}

resource "aws_route_table_association" "association_private_rta" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rtb.id
}