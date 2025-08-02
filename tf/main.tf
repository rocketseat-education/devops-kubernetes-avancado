terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./modules/vpc"

  vpc_name           = var.vpc_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "iam" {
  source = "./modules/iam"

  cluster_name = var.cluster_name
}

module "sg" {
  source = "./modules/sg"

  cluster_name = var.cluster_name
  vpc_id       = module.vpc.vpc_id
}

module "eks" {
  source = "./modules/eks"

  cluster_name              = var.cluster_name
  cluster_role_arn          = module.iam.cluster_role_arn
  node_role_arn             = module.iam.node_role_arn
  subnet_ids                = concat(module.vpc.public_subnet_ids, module.vpc.private_subnet_ids)
  private_subnet_ids        = module.vpc.private_subnet_ids
  cluster_security_group_id = module.sg.cluster_security_group_id
  node_security_group_id    = module.sg.node_security_group_id
  instance_types            = var.instance_types
  desired_capacity          = var.desired_capacity
  max_capacity              = var.max_capacity
  min_capacity              = var.min_capacity
  kubernetes_version        = var.kubernetes_version
}