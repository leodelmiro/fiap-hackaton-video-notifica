resource "aws_lambda_permission" "allow_sqs" {
  statement_id  = "AllowExecutionFromSQS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_base.function_name
  principal     = "sqs.amazonaws.com"
}

resource "aws_lambda_event_source_mapping" "sqs_event_notifica_erro" {
  event_source_arn = data.aws_sqs_queue.notifica-video-erro.arn
  function_name    = aws_lambda_function.lambda_base.function_name
}

resource "aws_lambda_event_source_mapping" "sqs_event_video_processado" {
  event_source_arn = data.aws_sqs_queue.notifica-video-processado.arn
  function_name    = aws_lambda_function.lambda_base.function_name
}