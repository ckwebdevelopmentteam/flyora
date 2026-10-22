import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export type StorageFolder =
  "packages" | "destinations" | "receipts" | "documents";

export class StorageService {
  private s3Client: S3Client | null = null;
  private isConfigured = false;
  private publicBucket: string;
  private privateBucket: string;
  private publicDomain: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    this.publicBucket = process.env.R2_PUBLIC_BUCKET || "flyora-public";
    this.privateBucket = process.env.R2_PRIVATE_BUCKET || "flyora-private";
    this.publicDomain =
      process.env.R2_PUBLIC_DOMAIN || "https://media.flyora.com";

    // Verify if valid Cloudflare R2 credentials are provided
    if (
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      !accessKeyId.includes("your-") &&
      !secretAccessKey.includes("your-")
    ) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
    }
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: StorageFolder = "packages",
  ) {
    const isPrivate = folder === "receipts" || folder === "documents";
    const targetBucket = isPrivate ? this.privateBucket : this.publicBucket;

    const safeExt = filename.split(".").pop()?.toLowerCase() || "jpg";
    const cleanName = filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .substring(0, 40);

    const fileKey = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${cleanName}.${safeExt}`;

    if (!this.isConfigured || !this.s3Client) {
      // Mock upload for development when R2 credentials are not yet configured in .env
      const mockPublicUrl = `${this.publicDomain}/${fileKey}`;
      return {
        uploadUrl: `http://localhost:5000/api/v1/storage/mock-upload?key=${encodeURIComponent(fileKey)}`,
        fileKey,
        publicUrl: mockPublicUrl,
        isMock: true,
      };
    }

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: fileKey,
      ContentType: contentType,
    });

    // 15-minute presigned upload window
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });

    const publicUrl = isPrivate
      ? ""
      : `${this.publicDomain.replace(/\/$/, "")}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      isMock: false,
    };
  }

  async getPresignedDownloadUrl(fileKey: string, expiresIn = 900) {
    if (!this.isConfigured || !this.s3Client) {
      return {
        downloadUrl: `${this.publicDomain}/${fileKey}`,
        isMock: true,
      };
    }

    const command = new GetObjectCommand({
      Bucket: this.privateBucket,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return {
      downloadUrl,
      isMock: false,
    };
  }
}
