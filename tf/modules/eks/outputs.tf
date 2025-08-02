output "cluster_id" {
  value = aws_eks_cluster.eks_cluster.id
}

output "cluster_arn" {
  value = aws_eks_cluster.eks_cluster.arn
}

output "cluster_endpoint" {
  value = aws_eks_cluster.eks_cluster.endpoint
}

output "cluster_security_group_id" {
  value = aws_eks_cluster.eks_cluster.vpc_config[0].cluster_security_group_id
}

output "cluster_certificate_authority_data" {
  value = aws_eks_cluster.eks_cluster.certificate_authority[0].data
}

output "node_group_arn" {
  value = aws_eks_node_group.eks_nodes.arn
}

output "node_group_status" {
  value = aws_eks_node_group.eks_nodes.status
}