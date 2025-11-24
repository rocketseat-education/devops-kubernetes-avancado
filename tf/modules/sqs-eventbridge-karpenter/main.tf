locals {
  queue_name = "${var.cluster_name}-karpenter-interruption-queue"

  default_tags = {
    Name = local.queue_name
    IAC  = "True"
  }

  tags = merge(local.default_tags)

  event_rule_arns = compact([
    aws_cloudwatch_event_rule.spot_interruption.arn,
    aws_cloudwatch_event_rule.spot_rebalance.arn,
    aws_cloudwatch_event_rule.instance_state_change.arn,
    aws_cloudwatch_event_rule.scheduled_change.arn
  ])
}

# SQS
resource "aws_sqs_queue" "queue" {
  name = local.queue_name

  message_retention_seconds  = var.message_retention_seconds
  receive_wait_time_seconds  = var.receive_wait_time_seconds
  visibility_timeout_seconds = var.visibility_timeout_seconds

  tags = local.tags
}

resource "aws_sqs_queue_policy" "queue" {
  queue_url = aws_sqs_queue.queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowEventBridgeSendMessage"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action   = "SQS:SendMessage"
        Resource = aws_sqs_queue.queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = local.event_rule_arns
          }
        }
      }
    ]
  })
}

#Rules
resource "aws_cloudwatch_event_rule" "spot_interruption" {
  name        = "${var.cluster_name}-SpotInterruption"
  description = "Spot Instance Interruption Warnings"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Spot Instance Interruption Warning"]
  })

  tags = local.tags
}

resource "aws_cloudwatch_event_rule" "spot_rebalance" {
  name        = "${var.cluster_name}-SpotRebalance"
  description = "Spot Instance Rebalance Recommendations"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Spot Instance Rebalance Recommendation"]
  })

  tags = local.tags
}

resource "aws_cloudwatch_event_rule" "instance_state_change" {
  name        = "${var.cluster_name}-InstanceStateChange"
  description = "EC2 Instance State-change Notification"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Instance State-change Notification"]
  })

  tags = local.tags
}

resource "aws_cloudwatch_event_rule" "scheduled_change" {
  name        = "${var.cluster_name}-ScheduledChange"
  description = "AWS Health Scheduled Changes"

  event_pattern = jsonencode({
    source      = ["aws.health"]
    detail-type = ["AWS Health Event"]
  })

  tags = local.tags
}

#Targets
resource "aws_cloudwatch_event_target" "spot_interruption" {
  rule      = aws_cloudwatch_event_rule.spot_interruption.name
  target_id = "KarpenterInterruptionQueue"
  arn       = aws_sqs_queue.queue.arn
}

resource "aws_cloudwatch_event_target" "spot_rebalance" {
  rule      = aws_cloudwatch_event_rule.spot_rebalance.name
  target_id = "KarpenterInterruptionQueue"
  arn       = aws_sqs_queue.queue.arn
}

resource "aws_cloudwatch_event_target" "instance_state_change" {
  rule      = aws_cloudwatch_event_rule.instance_state_change.name
  target_id = "KarpenterInterruptionQueue"
  arn       = aws_sqs_queue.queue.arn
}

resource "aws_cloudwatch_event_target" "scheduled_change" {
  rule      = aws_cloudwatch_event_rule.scheduled_change.name
  target_id = "KarpenterInterruptionQueue"
  arn       = aws_sqs_queue.queue.arn
}
