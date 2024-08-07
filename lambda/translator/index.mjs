// SPDX-License-Identifier: MIT
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
const bedrock_client = new BedrockRuntimeClient({region: process.env.BEDROCK_REGION});

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  
  if (typeof body.languages === 'undefined' || typeof body.message === 'undefined') {
    return {
      statusCode: 400,
      body: {result: "languages and message required"}
    }
  }
  

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    system: `あなたは翻訳の専門家です。プロンプトとしてJSONが送信されるので、仕様に基づいて翻訳し、JSONとして返却してください。返却時はJSON以外の出力を禁止します。

## 送信するJSON
- languageとmessageという2つのキーから構成されます。
- languageにはISO 639-1に基づく言語コードが複数配列で記載されています。
- messageには翻訳したい文章が記入されています。

## 翻訳時
- messageの文章や単語を、languagesに登録された言語に翻訳します。
- 文章や単語の言語は自動で検出してください。
- もし、翻訳対象と同じ言語がある場合は、翻訳処理を行わず、そのままの文章を返してください。例えば日本語の文章や単語と思われる場合は、日本語の結果は再翻訳せずそのまま返します。
- もし不明な言語コードがある場合は、翻訳せず空白として返します。

## 出力するJSON
- messagesというキーで構成されます。
- messagesの中には、翻訳結果に基づき、ISO 639-1に基づく言語コードをキー、その言語に翻訳した結果が値として入っているオブジェクトが入っています。`,
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
