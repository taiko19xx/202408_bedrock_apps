// SPDX-License-Identifier: MIT
import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  QueryCommand 
} from "@aws-sdk/lib-dynamodb";
const dynamodb_client = new DynamoDBClient({region: "ap-northeast-1"});
const document_client = DynamoDBDocumentClient.from(dynamodb_client);

export const handler = async (event) => {
  const document_params = {
    TableName: "image-tagger.table",
    ExpressionAttributeValues: {":pk": 1},
    ExpressionAttributeNames: {"#pk": "primary"},
    KeyConditionExpression: "#pk = :pk",
    ScanIndexForward: false,
  };
  
  if (
    typeof event.queryStringParameters !== "undefined" &&
    typeof event.queryStringParameters.tag !== "undefined" 
    ) {
    const tag = event.queryStringParameters.tag
    
    document_params.ExpressionAttributeValues[":tag"] = tag
    document_params.ExpressionAttributeNames["#tags"] = "tags"
    document_params.FilterExpression = "contains(#tags, :tag)"
  }
  
  const result = await document_client.send(new QueryCommand(document_params));
  
  // TODO implement
  const response = {
    statusCode: 200,
    body: {
      items: result.Items
    },
  };
  return response;
};
