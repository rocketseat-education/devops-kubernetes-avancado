resource "aws_sqs_queue" "queue" {
  name = var.queue_name

  message_retention_seconds  = var.message_retention_seconds
  receive_wait_time_seconds  = var.receive_wait_time_seconds
  visibility_timeout_seconds = var.visibility_timeout_seconds

  tags = {
    Name = var.queue_name
    IAC  = "True"
  }
}
