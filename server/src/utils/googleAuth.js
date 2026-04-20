const { GoogleAuth } = require('google-auth-library');

class GoogleAuthUtil {
    constructor() {
        this.auth = new GoogleAuth({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
    }

    async getAccessToken() {
        const client = await this.auth.getClient();
        const token = await client.getAccessToken();
        return token.token;
    }
}

module.exports = new GoogleAuthUtil();
