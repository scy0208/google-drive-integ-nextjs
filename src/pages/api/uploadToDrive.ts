import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { Readable } from 'stream';
import { S3 } from 'aws-sdk';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    console.log('Received POST request');

    const s3 = new S3();
    const imageUrl = req.body.imageUrl;

    // Extract the bucket name and key from the image URL
    const match = imageUrl.match(/https:\/\/(.+?)\.s3\.amazonaws\.com\/(.+)/);
    if (!match) {
      res.status(400).json({ message: "Invalid image URL" });
      return;
    }
    const bucket = match[1];
    const key = match[2];

    // Fetch the image data from S3
    const s3Response = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    if (!s3Response.Body) {
        res.status(500).json({ message: "Failed to fetch image data from S3" });
        return;
      }
    const fileData = s3Response.Body.toString('base64');

    console.log(`Access token: ${req.body.accessToken}`);

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/api/uploadToDrive" // This should be your redirect URI
    );

    oauth2Client.setCredentials({ access_token: req.body.accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    console.log('Uploading file to Google Drive');

    const buffer = Buffer.from(fileData, 'base64');
    const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: req.body.fileName,
        parents: [req.body.folderId],
      },
      media: {
        mimeType: req.body.mimeType,
        body: stream,
      },
    });

    console.log(`Uploaded file ID: ${response.data.id}`);

    res.status(200).json({ fileId: response.data.id });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}