// SPDX-License-Identifier: MIT
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
const bedrock_client = new BedrockRuntimeClient({region: process.env.BEDROCK_REGION});

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  
  if (typeof body.messages === 'undefined') {
    return {
      statusCode: 400,
      body: {result: "messages required"}
    }
  }

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: body.messages,
  };
  
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
  const apiResponse = await bedrock_client.send(command);
  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decodedResponseBody);
  const content = responseBody.content;
  
  console.log('--- bedrock ---')
  console.log('input_tokens: ' + responseBody.usage.input_tokens)
  console.log('output_tokens: ' + responseBody.usage.output_tokens)
  console.log("content");
  console.log(content)
  
  return {
    statusCode: 200,
    body: {response: content},
  };
};
