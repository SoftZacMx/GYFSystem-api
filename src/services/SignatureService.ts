import { createSign, createVerify } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from '../config';

export class SignatureService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(privateKeyPath: string, publicKeyPath: string) {
    this.privateKey = readFileSync(resolve(privateKeyPath), 'utf-8');
    this.publicKey = readFileSync(resolve(publicKeyPath), 'utf-8');
    logger.info('RSA keys loaded for digital signatures');
  }

  sign(data: Buffer): string {
    const signer = createSign('RSA-SHA256');
    signer.update(data);
    signer.end();
    return signer.sign(this.privateKey, 'base64');
  }

  verify(data: Buffer, signature: string): boolean {
    try {
      const verifier = createVerify('RSA-SHA256');
      verifier.update(data);
      verifier.end();
      return verifier.verify(this.publicKey, signature, 'base64');
    } catch (err) {
      logger.error({ err }, 'Signature verification failed');
      return false;
    }
  }
}
