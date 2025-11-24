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

variable "queue_name" {
  description = "Nome da fila SQS"
  type        = string
}

variable "message_retention_seconds" {
  description = "Tempo de retenção das mensagens na fila"
  type        = number
  default     = 300
}

variable "receive_wait_time_seconds" {
  description = "Tempo de espera para receber mensagens"
  type        = number
  default     = 20
}

variable "visibility_timeout_seconds" {
  description = "Timeout de visibilidade das mensagens"
  type        = number
  default     = 30
}
