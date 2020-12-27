const jose = require('node-jose');
const fetch = require('node-fetch');

function createAuthorizedResponse(userId,resource) {
    return {
      principalId: userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: resource
        }]
      }
    };
  }


module.exports.auth = async (event, context, callback) => {
    const methodArn = event.methodArn;
    const token = event.queryStringParameters.token;
    // console.log('token, line 22: ',token);
    if (!token) {
        return context.fail('Unauthorized');
    } else {
        // Get the kid from the headers prior to verification
        const sections = token.split('.');
        let header = jose.util.base64url.decode(sections[0]);
        header = JSON.parse(header);
        const kid = header.kid;

        // Fetch known valid keys
        const rawRes = await fetch('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_aXC7wIQu4/.well-known/jwks.json');
        const response = await rawRes.json();

        if (rawRes.ok) {
            const keys = response['keys'];
            const foundKey = keys.find((key) => key.kid === kid);

            if (!foundKey) {
                context.fail('Public key not found in jwks.json');
            } else {
                try {
                    const result = await jose.JWK.asKey(foundKey);
                    const keyVerify = jose.JWS.createVerify(result);
                    const verificationResult = await keyVerify.verify(token);

                    const claims = JSON.parse(verificationResult.payload);
                    console.log('claims: ',claims);
                    // Verify the token expiration
                    const currentTime = Math.floor(new Date() / 1000);
                    console.log('currentTime: ',currentTime);
                    console.log('claims.exp: ',claims.exp);
                    if (currentTime > claims.exp) {
                        console.error('Token expired!');
                        context.fail('Token expired!');
                    } else if (claims.aud !== '7qcifrdcgv6rhb3k1tj526g77c') {
                        console.error('Token wasn\'t issued for target audience');
                        context.fail('Token was not issued for target audience');
                    } else {
                        console.log('claims.sub: ',claims.sub);
                        context.succeed(createAuthorizedResponse(claims.sub, methodArn));
                    }
                } catch (error) {
                    console.error('Unable to verify token', error);
                    context.fail('Signature verification failed');
                }
            }
        }
    }
};