import * as crypto from 'crypto'

const IV_LENGTH = 16; // For AES, this is always 16

class Encryptor {
    encrypt(key: string, text: string) {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
    
        encrypted = Buffer.concat([encrypted, cipher.final()]);
    
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    
    decrypt(key: string, text: string) {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
    
        return decrypted.toString();
    }
}

export const encryptor = new Encryptor()