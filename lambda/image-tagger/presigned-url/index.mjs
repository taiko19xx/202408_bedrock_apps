// SPDX-License-Identifier: MIT
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3_client = new S3Client({region: 'ap-northeast-1'});

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const handler = async (event) => {
  const url = await getSignedUrl(
      s3_client, 
      new PutObjectCommand({Bucket: process.env.BUCKET_NAME, Key: event.queryStringParameters.filename}),
      { expiresIn: 3600 }
    )
  
  const response = {
    statusCode: 200,
    body: {
      presigned_url: url
    }
  };
  return response;
};
