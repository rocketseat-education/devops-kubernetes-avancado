variable "cluster_name" {
  description = "Nome do Cluster"
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
