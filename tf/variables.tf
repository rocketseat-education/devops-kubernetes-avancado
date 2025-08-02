variable "cluster_name" {
  type    = string
  default = "rocketseat-eks"
}

variable "vpc_name" {
  type    = string
  default = "rocketseat"
}

variable "region" {
  type    = string
  default = "us-east-2"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-2a", "us-east-2b", "us-east-2c"]
}

variable "instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}

variable "desired_capacity" {
  type    = number
  default = 1
}

variable "max_capacity" {
  type    = number
  default = 1
}

variable "min_capacity" {
  type    = number
  default = 1
}

variable "kubernetes_version" {
  type    = string
  default = "1.33"
}