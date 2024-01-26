// src/pages/api/fetchImageUrlsFromS3.ts
import type { NextApiRequest, NextApiResponse } from "next";
import AWS from 'aws-sdk';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    console.log('Received GET request');

    try {
      const s3 = new AWS.S3();
      const data = await s3.listObjectsV2({ Bucket: "google-drive-integ" }).promise();
      const urls = data.Contents?.map(file => `https://google-drive-integ.s3.amazonaws.com/${file.Key}`) || [];

      res.status(200).json({ urls: urls });
    } catch (error) {
      console.error(`Error fetching image URLs from S3: ${error}`);
      res.status(500).json({ message: `Error fetching image URLs from S3: ${error}` });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}