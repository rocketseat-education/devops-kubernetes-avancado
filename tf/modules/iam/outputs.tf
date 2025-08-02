output "cluster_role_arn" {
  value = aws_iam_role.eks_cluster_role.arn
}

output "node_role_arn" {
  value = aws_iam_role.eks_nodes_role.arn
}

output "cluster_role_name" {
  value = aws_iam_role.eks_cluster_role.name
}

output "node_role_name" {
  value = aws_iam_role.eks_nodes_role.name
}