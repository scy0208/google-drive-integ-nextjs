// src/pages/api/fetchImageFromDriveToS3.ts
import type { NextApiRequest, NextApiResponse } from "next";
import AWS from 'aws-sdk';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
    if (req.method === 'POST') {
      console.log('Received POST request');
  
      const fileId = req.body.fileId;
      const accessToken = req.body.accessToken;
  
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const headers = { 'Authorization': 'Bearer ' + accessToken };
      console.log(`Sending request to URL: ${url} with headers: `, headers);
      const response = await fetch(url, { headers });
  
      if (!response.ok) {
        res.status(response.status).json({ message: `HTTP error! status: ${response.status}` });
        return;
      }
  
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`Received buffer for file ID: ${fileId}`);
  
      // Upload the image to S3
      const s3 = new AWS.S3();
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME || "google-drive-integ",
        Key: `${fileId}.jpg`,
        Body: buffer,
      };
  
      const uploadResponse = await s3.upload(params).promise();
      console.log('Upload response:', uploadResponse);
  
      res.status(200).json({ location: uploadResponse.Location });
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  }