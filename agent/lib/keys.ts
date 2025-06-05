import fs from 'fs';
import crypto from 'crypto';

export function loadPrivateKeyFromFile(filePath: string) {
  const keyData = fs.readFileSync(filePath, 'utf8');
  const privateKey = crypto.createPrivateKey({
    key: keyData,
    format: 'pem',
    // If your key is encrypted, you'd need to provide a passphrase here
    // passphrase: 'your-passphrase'
  });
  return privateKey;
}

export function signPssText(privateKey: crypto.KeyObject, text: string) {
  // Before signing, we need to hash our message.
  // The hash is what we actually sign.
  // Convert the text to bytes
  const message = Buffer.from(text, 'utf-8');

  try {
    const signature = crypto.sign('sha256', message, {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });
    return signature.toString('base64');
  } catch (error) {
    throw new Error('RSA sign PSS failed: ' + error.message);
  }
}
