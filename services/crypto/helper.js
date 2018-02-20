const crypto = require('crypto');
const config = require('./config');

const Helper = {
    encrypt: (plain, key) => {
        key = key || config.key;
        var cipher = crypto.createCipher('aes-256-cbc', key);
        var secure = cipher.update(plain, 'utf8', 'hex');
        secure += cipher.final('hex');
        return secure;
    },
    decrypt: (secure, key) => {
        try {
            key = key || config.key;
            var decipher = crypto.createDecipher('aes-256-cbc', key);
            var plain = decipher.update(secure, 'hex', 'utf8');
            console.log('plain : ' + plain);
            plain += decipher.final('utf8');
            return plain;
        } catch(e) {
            console.log('================================================================================');
            console.log('secure :'+ secure);
            console.log('key :'+ key);
            console.log('e :'+ e);
            console.log('================================================================================');
            return secure
        }
    }
};

module.exports = Helper;