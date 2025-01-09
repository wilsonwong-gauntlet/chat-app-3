import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

if (!process.env.AWS_ACCESS_KEY_ID) throw new Error("AWS_ACCESS_KEY_ID is required");
if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error("AWS_SECRET_ACCESS_KEY is required");
if (!process.env.AWS_REGION) throw new Error("AWS_REGION is required");
if (!process.env.AWS_S3_BUCKET_NAME) throw new Error("AWS_S3_BUCKET_NAME is required");

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export type PresignedUrlResponse = {
  presignedUrl: string;
  key: string;
  fileUrl: string;
};

export async function generatePresignedUrl(
  fileType: string,
  fileName: string
): Promise<PresignedUrlResponse> {
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${uuidv4()}-${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 60 * 5,
  });
  
  const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  console.log('Generated URLs:', {
    presignedUrl,
    fileUrl,
    key
  });

  return {
    presignedUrl,
    key,
    fileUrl,
  };
}

export function getFileType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  
  if (imageExtensions.includes(extension)) {
    return "image";
  }
  
  return "file";
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be less than 5MB";
  }
  
  return null;
} 