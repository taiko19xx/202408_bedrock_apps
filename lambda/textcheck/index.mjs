// SPDX-License-Identifier: MIT
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
const bedrock_client = new BedrockRuntimeClient({region: process.env.BEDROCK_MREGION});

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  
  if (typeof body.style === 'undefined' || typeof body.body === 'undefined') {
    return {
      statusCode: 400,
      body: {result: "style and body required"}
    }
  }

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: `あなたは文章校正の専門家です。次のルールでJSONが送られてくるので、その文章をチェックして、その結果をJSONでルールに従って返してください。結果を返すときはJSON以外の文字列を返さないでください。

## 送信JSON
- styleとbodyという2つのキーがあります。
- styleは校正する文章のスタイルです。例えば、ビジネスメール、フォーマルなチャット、などのように記載されています。
- bodyはメッセージ本文です。

## チェック
- bodyの内容を、styleの文章としてチェックしてください。
- チェック後、校正すべき部分、校正した結果、そしてその理由を部分ごとに教えてください。
- また、校正した文章もセットで教えてください。
- 絵文字も利用可能ですが、適切な場面でのみ利用してください。

## 返却JSON
- resultというキーがあり、その中にcomposeとbodyというキーがあります。
- bodyには校正した文章が入ります。
- composeの中には、校正すべき点が配列で入っています。
    - 校正すべき点をpart
    - 校正すべき理由をreason
    - 校正した結果をresult
    - この3つのオブジェクトが校正部分ごとに存在し、composeの配列の中に格納されています。`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify(body)
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
  
  return {
    statusCode: 200,
    body: json,
  };
};
