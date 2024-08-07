// SPDX-License-Identifier: MIT
import { 
  S3Client, 
  GetObjectCommand
} from '@aws-sdk/client-s3';
const s3_client = new S3Client({region: 'ap-northeast-1'});

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
const bedrock_client = new BedrockRuntimeClient({region: process.env.BEDROCK_REGION});

import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand 
} from "@aws-sdk/lib-dynamodb";
const dynamodb_client = new DynamoDBClient({region: "ap-northeast-1"});
const document_client = DynamoDBDocumentClient.from(dynamodb_client);

export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const object_key = event.Records[0].s3.object.key;

  console.log('--- s3 ---')
  console.log('bucket: ' + bucket)
  console.log('object_key: ' + object_key)

  const s3_params = {
    Bucket: bucket,
    Key: object_key
  };
  const response = await s3_client.send(new GetObjectCommand(s3_params));
  const stream = response.Body;
  const content_buffer = Buffer.concat(await stream.toArray());

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    system: "あなたは画像分析の天才です。指示されない内容について、JSONで返してください。JSON文字列以外をレスポンスに含めることは禁止します。",
    messages: [
      {
        role: "user",
        content: [
          {            
            type: "image",
            source: {
              type: "base64",
              media_type: response.ContentType,
              data: content_buffer.toString("base64")
            }
          },
          {
            type: "text",
            text: "この画像について、想定されるタグを日本語で最大10個考えて、tagsのキーの中に配列で格納して教えてください。タグは文章ではなくなるべく単語のみで構成してください。"
          }
        ],
      }
    ],
  };

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
  const apiResponse = await bedrock_client.send(command);
  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decodedResponseBody);
  const json = JSON.parse(responseBody.content[0].text);

  console.log('--- bedrock ---')
  console.log('input_tokens: ' + responseBody.usage.input_tokens)
  console.log('output_tokens: ' + responseBody.usage.output_tokens)
  console.log("json:");
  console.log(json)

  const document_params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      primary: 1,
      datetime: Date.now(),
      object: object_key,
      tags: json.tags
    },
  };

  const result = await document_client.send(new PutCommand(document_params));

  console.log('--- dynamodb ---')
  console.log('putitem:')
  console.log(result)
};
