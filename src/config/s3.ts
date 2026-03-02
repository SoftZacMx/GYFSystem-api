import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export function createS3Client(): S3Client {
  return new S3Client({
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    ...(env.S3_ENDPOINT && { endpoint: env.S3_ENDPOINT }),
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  });
}

export const s3Client = createS3Client();
export const s3Bucket = env.S3_BUCKET;
