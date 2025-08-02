variable "cluster_name" {
  type = string
}

variable "cluster_role_arn" {
  type = string
}

variable "node_role_arn" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "cluster_security_group_id" {
  type = string
}

variable "node_security_group_id" {
  type = string
}

variable "instance_types" {
  type = list(string)
}

variable "desired_capacity" {
  type = number
}

variable "max_capacity" {
  type = number
}

variable "min_capacity" {
  type = number
}

variable "kubernetes_version" {
  type = string
}

variable "ec2_ssh_key" {
  type    = string
  default = null
}