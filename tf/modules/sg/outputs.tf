output "cluster_security_group_id" {
  value = aws_security_group.eks_cluster_sg.id
}

output "node_security_group_id" {
  value = aws_security_group.eks_nodes_sg.id
}