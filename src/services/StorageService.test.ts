import { describe, it, expect, vi } from 'vitest';
import { StorageService } from './StorageService';
import type { S3Client } from '@aws-sdk/client-s3';

describe('StorageService', () => {
  it('upload sends PutObjectCommand and returns key and fileUrl', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const client = { send } as unknown as S3Client;
    const service = new StorageService(client, 'my-bucket', 'us-east-1');

    const result = await service.upload(Buffer.from('content'), 'doc.pdf', 'application/pdf');

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].constructor.name).toBe('PutObjectCommand');
    expect(result).toMatchObject({
      key: expect.stringMatching(/^documents\/[a-f0-9-]+\.pdf$/),
      fileUrl: expect.stringContaining('my-bucket'),
    });
    expect(result.fileUrl).toContain(result.key);
  });

  it('buildUrl uses endpoint when provided', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const client = { send } as unknown as S3Client;
    const service = new StorageService(client, 'bucket', 'us-east-1', 'https://s3.local');

    const result = await service.upload(Buffer.from('x'), 'f.txt', 'text/plain');

    expect(result.fileUrl).toMatch(/^https:\/\/s3\.local\/bucket\/documents\//);
  });
});
