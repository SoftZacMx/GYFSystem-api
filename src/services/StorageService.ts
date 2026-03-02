import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export interface UploadResult {
  key: string;
  fileUrl: string;
}

export class StorageService {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly region: string,
    private readonly endpoint?: string,
  ) {}

  async upload(file: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(originalName) || '';
    const key = `documents/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      }),
    );

    const fileUrl = this.buildUrl(key);
    return { key, fileUrl };
  }

  async download(fileUrl: string): Promise<Buffer> {
    const key = this.extractKey(fileUrl);
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk as Uint8Array));
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async deleteByFileUrl(fileUrl: string): Promise<void> {
    const key = this.extractKey(fileUrl);
    await this.delete(key);
  }

  private extractKey(fileUrl: string): string {
    if (this.endpoint) {
      const prefix = `${this.endpoint}/${this.bucket}/`;
      if (fileUrl.startsWith(prefix)) return fileUrl.slice(prefix.length);
    }
    const s3Prefix = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;
    if (fileUrl.startsWith(s3Prefix)) return fileUrl.slice(s3Prefix.length);
    return fileUrl;
  }

  private buildUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
