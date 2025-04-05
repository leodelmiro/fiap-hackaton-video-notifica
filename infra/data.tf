data "aws_iam_role" "LabRole" {
  name = "LabRole"
}

data "aws_sqs_queue" "notifica-video-processado" {
  name = "notifica-video-processado"
}
data "aws_sqs_queue" "notifica-video-erro" {
  name = "notifica-video-erro"
}