const logger = require('../../config/logger.js');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = 'abcdefghijklmnop'.repeat(2);
const IV_LENGTH = 16;

module.exports = class cryptoService {

    // 암호화 메서드
    static cipher = (content) => {
        // const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from('abcdefghijklmnopqr'.repeat(2)), iv);

        // let encrypted = cipher.update(content, 'utf8', 'hex');
        // encrypted += cipher.final('hex');
                    
        // return encrypted;
        const iv = crypto.randomBytes(IV_LENGTH)
        console.log("decipher", algorithm, ENCRYPTION_KEY, iv)
        const cipher = crypto.createCipheriv(
            algorithm,
            Buffer.from(ENCRYPTION_KEY),
            iv,
        )
        const encrypted = cipher.update(content)

        return (
            iv.toString('hex') +
            ':' +
            Buffer.concat([encrypted, cipher.final()]).toString('hex')
        )
    }

    // 복호화 메서드
    static decipher = (content) => {
        // const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from('abcdefghijklmnop'.repeat(2)), iv);

        // let decrypted = decipher.update(content, 'hex', 'utf8');
        // decrypted += decipher.final('utf8');
        // return decrypted;
        console.log("content", content)
        const textParts = content.split(':')
        const iv = Buffer.from(textParts.shift(), 'hex')
        const encryptedText = Buffer.from(textParts.join(':'), 'hex')
        console.log("decipher", algorithm, ENCRYPTION_KEY, iv)
        const decipher = crypto.createDecipheriv(
            algorithm,
            Buffer.from(ENCRYPTION_KEY),
            iv,
        )
        const decrypted = decipher.update(encryptedText)

        return Buffer.concat([decrypted, decipher.final()]).toString()
    }

}