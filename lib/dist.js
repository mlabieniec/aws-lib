import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, RespondToAuthChallengeCommand } from '@aws-sdk/client-cognito-identity-provider';
import ls from 'localstorage-slim';
import encUTF8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';

var AppStack = {
	cognitoIdentityPoolID: "us-east-1:3c32a4f0-cd83-4eff-bce8-22144dee7b80",
	cognitoUserPoolClientID: "fiea480dpek44e71t52qkiipf",
	cognitoUserpoolID: "us-east-1_MOq2y9G4G",
	data: "https://hlwkrq00q7.execute-api.us-east-1.amazonaws.com/prod/data",
	auth: "https://hlwkrq00q7.execute-api.us-east-1.amazonaws.com/prod/auth",
	google: "677953287897-2brf5vfk5tbs9t7a607tuiu8mjqavaej.apps.googleusercontent.com",
	id: "74a7c66d-af69-5b3a-b43b-19310b2a23a1",
	region: "us-east-1"
};
var Exports = {
	AppStack: AppStack
};

class Util {

    assertDefined(object, name) {
        if (object === undefined) {
            throw name + ' must be defined';
        } else {
            return object;
        }
    }
    
    assertParametersDefined(params, keys, ignore) {
        if (keys === undefined) {
            return;
        }
        if (keys.length > 0 && params === undefined) {
            params = {};
        }
        for (var i = 0; i < keys.length; i++) {
            if(!apiGateway.core.utils.contains(ignore, keys[i])) {
                apiGateway.core.utils.assertDefined(params[keys[i]], keys[i]);
            }
        }
    }
    
    parseParametersToObject(params, keys) {
        if (params === undefined) {
            return {};
        }
        var object = { };
        for (var i = 0; i < keys.length; i++) {
            object[keys[i]] = params[keys[i]];
        }
        return object;
    }

    contains(a, obj) {
        if(a === undefined) { return false;}
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }

    copy(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    mergeInto(baseObj, additionalProps) {
        if (null == baseObj || "object" != typeof baseObj) return baseObj;
        var merged = baseObj.constructor();
        for (var attr in baseObj) {
            if (baseObj.hasOwnProperty(attr)) merged[attr] = baseObj[attr];
        }
        if (null == additionalProps || "object" != typeof additionalProps) return baseObj;
        for (attr in additionalProps) {
            if (additionalProps.hasOwnProperty(attr)) merged[attr] = additionalProps[attr];
        }
        return merged;
    }

}

const axios$1 = require('axios');
const CryptoJS = require("crypto-js");
class Sigv4Client {

    AWS_SHA_256 = 'AWS4-HMAC-SHA256';
    AWS4_REQUEST = 'aws4_request';
    AWS4 = 'AWS4';
    X_AMZ_DATE = 'x-amz-date';
    X_AMZ_SECURITY_TOKEN = 'x-amz-security-token';
    HOST = 'host';
    AUTHORIZATION = 'Authorization';
    
    client;
    config;
    
    constructor(config) {
        let awsSigV4Client = {};
        awsSigV4Client.accessKey = Util.assertDefined(config.accessKey, 'accessKey');
        awsSigV4Client.secretKey = Util.assertDefined(config.secretKey, 'secretKey');
        awsSigV4Client.sessionToken = config.sessionToken;
        awsSigV4Client.serviceName = Util.assertDefined(config.serviceName, 'serviceName');
        awsSigV4Client.region = Util.assertDefined(config.region, 'region');
        awsSigV4Client.endpoint = Util.assertDefined(config.endpoint, 'endpoint');
        this.client = awsSigV4Client;
        this.config = config;
    }

    makeRequest(request) {
        var verb = Util.assertDefined(request.verb, 'verb');
        var path = Util.assertDefined(request.path, 'path');
        var queryParams = Util.copy(request.queryParams);
        if (queryParams === undefined) {
            queryParams = {};
        }
        var headers = Util.copy(request.headers);
        if (headers === undefined) {
            headers = {};
        }

        //If the user has not specified an override for Content type the use default
        if(headers['Content-Type'] === undefined) {
            headers['Content-Type'] = this.config.defaultContentType;
        }

        //If the user has not specified an override for Accept type the use default
        if(headers['Accept'] === undefined) {
            headers['Accept'] = this.config.defaultAcceptType;
        }

        var body = Util.copy(request.body);
        if (body === undefined || verb === 'GET') { // override request body and set to empty when signing GET requests
            body = '';
        }  else {
            body = JSON.stringify(body);
        }

        //If there is no body remove the content-type header so it is not included in SigV4 calculation
        if(body === '' || body === undefined || body === null) {
            delete headers['Content-Type'];
        }

        var datetime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[:\-]|\.\d{3}/g, '');
        headers[X_AMZ_DATE] = datetime;
        var parser = document.createElement('a');
        parser.href = this.client.endpoint;
        headers[HOST] = parser.hostname;

        var canonicalRequest = buildCanonicalRequest(verb, path, queryParams, headers, body);
        var hashedCanonicalRequest = hashCanonicalRequest(canonicalRequest);
        var credentialScope = buildCredentialScope(datetime, this.client.region, this.client.serviceName);
        var stringToSign = buildStringToSign(datetime, credentialScope, hashedCanonicalRequest);
        var signingKey = calculateSigningKey(this.client.secretKey, datetime, this.client.region, this.client.serviceName);
        var signature = calculateSignature(signingKey, stringToSign);
        headers[AUTHORIZATION] = buildAuthorizationHeader(this.client.accessKey, credentialScope, headers, signature);
        if(awsSigV4Client.sessionToken !== undefined && this.client.sessionToken !== '') {
            headers[X_AMZ_SECURITY_TOKEN] = this.client.sessionToken;
        }
        delete headers[HOST];

        var url = config.endpoint + path;
        var queryString = buildCanonicalQueryString(queryParams);
        if (queryString != '') {
            url += '?' + queryString;
        }

        //Need to re-attach Content-Type if it is not specified at this point
        if(headers['Content-Type'] === undefined) {
            headers['Content-Type'] = config.defaultContentType;
        }

        var signedRequest = {
            method: verb,
            url: url,
            headers: headers,
            data: body
        };
        return axios$1(signedRequest);
    }

    hash(value) {
        return CryptoJS.SHA256(value);
    }

    hexEncode(value) {
        return value.toString(CryptoJS.enc.Hex);
    }

    hmac(secret, value) {
    return CryptoJS.HmacSHA256(value, secret, {asBytes: true});
    }

    buildCanonicalRequest(method, path, queryParams, headers, payload) {
        return method + '\n' +
            buildCanonicalUri(path) + '\n' +
            buildCanonicalQueryString(queryParams) + '\n' +
            buildCanonicalHeaders(headers) + '\n' +
            buildCanonicalSignedHeaders(headers) + '\n' +
            hexEncode(hash(payload));
    }

    hashCanonicalRequest(request) {
        return hexEncode(hash(request));
    }

    buildCanonicalUri(uri) {
        return encodeURI(uri);
    }

    buildCanonicalQueryString(queryParams) {
        if (Object.keys(queryParams).length < 1) {
            return '';
        }

        var sortedQueryParams = [];
        for (var property in queryParams) {
            if (queryParams.hasOwnProperty(property)) {
                sortedQueryParams.push(property);
            }
        }
        sortedQueryParams.sort();

        var canonicalQueryString = '';
        for (var i = 0; i < sortedQueryParams.length; i++) {
            canonicalQueryString += sortedQueryParams[i] + '=' + fixedEncodeURIComponent(queryParams[sortedQueryParams[i]]) + '&';
        }
        return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
    }

    fixedEncodeURIComponent (str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }

    buildCanonicalHeaders(headers) {
        var canonicalHeaders = '';
        var sortedKeys = [];
        for (var property in headers) {
            if (headers.hasOwnProperty(property)) {
                sortedKeys.push(property);
            }
        }
        sortedKeys.sort();

        for (var i = 0; i < sortedKeys.length; i++) {
            canonicalHeaders += sortedKeys[i].toLowerCase() + ':' + headers[sortedKeys[i]] + '\n';
        }
        return canonicalHeaders;
    }

    buildCanonicalSignedHeaders(headers) {
        var sortedKeys = [];
        for (var property in headers) {
            if (headers.hasOwnProperty(property)) {
                sortedKeys.push(property.toLowerCase());
            }
        }
        sortedKeys.sort();

        return sortedKeys.join(';');
    }

    buildStringToSign(datetime, credentialScope, hashedCanonicalRequest) {
        return AWS_SHA_256 + '\n' +
            datetime + '\n' +
            credentialScope + '\n' +
            hashedCanonicalRequest;
    }

    buildCredentialScope(datetime, region, service) {
        return datetime.substr(0, 8) + '/' + region + '/' + service + '/' + AWS4_REQUEST
    }

    calculateSigningKey(secretKey, datetime, region, service) {
        return hmac(hmac(hmac(hmac(AWS4 + secretKey, datetime.substr(0, 8)), region), service), AWS4_REQUEST);
    }

    calculateSignature(key, stringToSign) {
        return hexEncode(hmac(key, stringToSign));
    }

    buildAuthorizationHeader(accessKey, credentialScope, headers, signature) {
        return AWS_SHA_256 + ' Credential=' + accessKey + '/' + credentialScope + ', SignedHeaders=' + buildCanonicalSignedHeaders(headers) + ', Signature=' + signature;
    }
}

const axios = require('axios');
class HttpClient {
    constructor(config) {

    }

    makeRequest = function (request) {
        var verb = Util.assertDefined(request.verb, 'verb');
        var path = Util.assertDefined(request.path, 'path');
        var queryParams = Util.copy(request.queryParams);
        if (queryParams === undefined) {
            queryParams = {};
        }
        var headers = Util.copy(request.headers);
        if (headers === undefined) {
            headers = {};
        }

        //If the user has not specified an override for Content type the use default
        if(headers['Content-Type'] === undefined) {
            headers['Content-Type'] = config.defaultContentType;
        }

        //If the user has not specified an override for Accept type the use default
        if(headers['Accept'] === undefined) {
            headers['Accept'] = config.defaultAcceptType;
        }

        var body = Util.copy(request.body);
        if (body === undefined) {
            body = '';
        }

        var url = config.endpoint + path;
        var queryString = this.buildCanonicalQueryString(queryParams);
        if (queryString != '') {
            url += '?' + queryString;
        }
        var simpleHttpRequest = {
            method: verb,
            url: url,
            headers: headers,
            data: body
        };
        return axios(simpleHttpRequest);
    }

    buildCanonicalQueryString(queryParams) {
        //Build a properly encoded query string from a QueryParam object
        if (Object.keys(queryParams).length < 1) {
            return '';
        }

        var canonicalQueryString = '';
        for (var property in queryParams) {
            if (queryParams.hasOwnProperty(property)) {
                canonicalQueryString += encodeURIComponent(property) + '=' + encodeURIComponent(queryParams[property]) + '&';
            }
        }

        return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
    }
}

class RESTClient {
    config = {};
    invokeUrl;
    endpoint;
    pathComponent;
    sigV4ClientConfig;
    simpleHttpClientConfig;
    sigv4client;
    httpclient;
    constructor(config, invokeUrl) {
        if(config === undefined) {
            this.config = {
                accessKey: '',
                secretKey: '',
                sessionToken: '',
                region: '',
                apiKey: undefined,
                defaultContentType: 'application/json',
                defaultAcceptType: 'application/json'
            };
        } else {
            this.config = config;
        }
        this.invokeUrl = invokeUrl;
        this.endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
        this.pathComponent = pathComponent = invokeUrl.substring(endpoint.length);
        this.sigV4ClientConfig = {
            ...config,
            serviceName: 'execute-api',
            endpoint: endpoint,
        };
        if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') ;
        this.simpleHttpClientConfig = {
            endpoint: endpoint,
            defaultContentType: config.defaultContentType,
            defaultAcceptType: config.defaultAcceptType
        };

        this.sigv4client = new Sigv4Client(this.sigV4ClientConfig);

        this.httpclient = new HttpClient(this.simpleHttpClientConfig);
    }

    /**
     * 
     * @param {*} request { headers: {}, body: {}, queryParams: {} } 
     * @param {*} authType 'AWS_IAM' or undefined
     * @param {*} additionalParams { headers: {}, queryParams: {}}
     * @param {*} apiKey API Key String
     * @returns {*} an axios response
     */
    request(request = {}, authType = 'AWS_IAM', additionalParams = {}, apiKey) {
        //Attach the apiKey to the headers request if one was provided
        if (apiKey !== undefined && apiKey !== '' && apiKey !== null) {
            request.headers['x-api-key'] = apiKey;
        }

        if (request.body === undefined || request.body === '' || request.body === null || Object.keys(request.body).length === 0) {
            request.body = undefined;
        }

        // If the user specified any additional headers or query params that may not have been modeled
        // merge them into the appropriate request properties
        request.headers = apiGateway.core.utils.mergeInto(request.headers, additionalParams.headers);
        request.queryParams = apiGateway.core.utils.mergeInto(request.queryParams, additionalParams.queryParams);

        if (authType === 'AWS_IAM') {
            return this.sigv4client.makeRequest(request);
        } else {
            return this.httpclient.makeRequest(request);
        }
    }

    options(params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        utils.assertParametersDefined(params, [], ['body']);
        
        let dataOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/data').expand(utils.parseParametersToObject(params, [])),
            headers: utils.parseParametersToObject(params, []),
            queryParams: utils.parseParametersToObject(params, []),
            body: body
        };
        
        return this.request(dataOptionsRequest, authType, additionalParams, config.apiKey);
    }
}

const API_URL = Exports.AppStack.data;
const STORAGE_KEY_CREDENTIALS = 'credentials';

class Config {

    /**
     * Access exported Cloudformation values
     */
    exports = Exports.AppStack;

    /**
     * Configure local storage encryption
     * @param {boolean} encrypt local storage
     * @param {string} encryption key
     * @returns null
     */
    encryption(encrypt = true, secret = 'secret-string-to-be-replaced') {
        // update localstorage-slim
        ls.config.encrypt = true;             // global encryption
        ls.config.secret = 'secret-string-to-be-replaced';   // global secret

        // update encrypter to use AES encryption
        ls.config.encrypter = (data, secret) => AES.encrypt(JSON.stringify(data), secret).toString();
        
        // update decrypter to decrypt AES-encrypted data
        ls.config.decrypter = (data, secret) => {
        try {
            return JSON.parse(AES.decrypt(data, secret).toString(encUTF8));
        } catch (e) {
            // incorrect/missing secret, return the encrypted data instead
            return data;
        }
        };
    }
}

class API {

    // Rest API Endpoint
    apiUrl = new URL(API_URL);

    // signing for API calls
    sigv4;

    // an authenticated Auth instance
    auth;

    // rest client instance
    client;

    constructor(auth) {
        this.auth = auth;
    }

    async request(
        apiUrl = this.apiUrl, 
        method = 'GET', 
        apiKey,
        body) {
        this.client = new RESTClient({
            accessKey: (auth)?this.auth.credentials.AccessKeyId:'',
            secretKey: (auth)?this.auth.credentials.SecretKey:'',
            sessionToken: (auth)?this.auth.credentials.SessionToken:'',
            region: Exports.AppStack.region,
            apiKey: apiKey,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        }, apiUrl.href);
        try {
            const req = { verb: method };
            if (body) req.body = body;
            const data = this.client.request(req);
            console.log('Successfully received data: ', data);
            return data;
        } catch (error) {
            console.log('An error occurred', error);
            throw error;
        }
    }
}

class Auth {

    // Cognito Identities client for making calls to the service
    cognitoIdentities;
    
    // Cognito User Pools client
    cognitoUserPools;
    
    // App Client ID from configuration
    clientId;
    
    // The current challenge session from requesting a code
    challengeSession;

    // The final Authentication Result containing ID and Access tokens for making authenticated calls
    /**
     * @AuthenticationResult: 
        AccessToken: String
        ExpiresIn: Number
        IdToken: String 
        NewDeviceMetadata: undefined
        RefreshToken: String 
        TokenType: "Bearer"
     */
    access;

    // Temp credentials and identity from Cognito Identity Pools (Authz)
    credentials;
    identityId;

    // The Cognito Provider (IDP) key name to be provided in GetID (authenticated) calls
    cognitoProviderLoginName;

    // mock password to send with requests using CUSTOM_AUTH
    password = 'asdfghJKL@5679';

    /**
     * The Authentication flow to use
     */
    AUTH_FLOW = {
        CUSTOM_AUTH: "CUSTOM_AUTH",
        USERNAME_PASSWORD: "USERNAME_PASSWORD",
        SRP: "SRP"
    };

    AUTH_PROVIDERS = {
        'google': 'accounts.google.com'
    };

    constructor() {
        this.cognitoIdentities = new CognitoIdentityClient({ 
            region: Exports.AppStack.region 
        });
        this.cognitoUserPools = new CognitoIdentityProviderClient({ 
            region: Exports.AppStack.region
        });
        this.clientId = Exports.AppStack.cognitoUserPoolClientID;
        this.cognitoProviderLoginName = `cognito-idp.${Exports.AppStack.region}.amazonaws.com/${Exports.AppStack.cognitoUserPoolID}`;
        this.init();
    }

    /**
     * @private
     * Instantiates the cognito clients and stores credentials and identity id for later use
     * This will get re-run once authenticated in order to retrieve credentials for the authenticated
     * identity ID. Prior to authenticating, a 'guest' ID will be retrieved and assume an 'unauthenticated' role
     */
    async init() {

        if (ls.get(STORAGE_KEY_CREDENTIALS)) {
            const item = ls.get(STORAGE_KEY_CREDENTIALS);
            this.credentials = item.Credentials;
            this.identityId = item.IdentityId;
            return;
        }

        // 1. Get the Identity ID of the user from Cognito Identity Pools via the Identity Pools ID. This
        //    initial ID will assume an 'unauthenticated' or 'guest' role since no Logins map is sent
        const getIdPayload = { IdentityPoolId: Exports.AppStack.cognitoIdentityPoolID };
        if (!this.access) {
            //getIdPayload.Logins = {};
            //getIdPayload.Logins[this.cognitoProviderLoginName] = this.access.IdToken || '';
            const getId = new GetIdCommand(getIdPayload);
            this.identityId = (await this.cognitoIdentities.send(getId)).IdentityId;
        }
        // 2. Get AWS credentials to make AWS service calls based on the assumed role. The role assumed
        //    will be dependent on the ID that is sent. ID Tokens are retrieved from authenticating.
        const getCredsPayload = { IdentityId: this.identityId };
        if (this.access) {
            getCredsPayload.Logins = {};
            getCredsPayload.Logins[this.cognitoProviderLoginName] = this.access.IdToken;
        }
        const getCreds = new GetCredentialsForIdentityCommand(getCredsPayload);
        const getCredsResponse = await this.cognitoIdentities.send(getCreds);
        this.credentials = getCredsResponse.Credentials;
        this.identityId = getCredsResponse.IdentityId;
        ls.set(STORAGE_KEY_CREDENTIALS, getCredsResponse);
    }

    /**
     * initialize an identity and credentials for an external identity provider
     * @param {string} provider
     * @param {string} token 
     */
    async initProvider(provider, token) {
        const getIdPayload = { IdentityPoolId: Exports.AppStack.cognitoIdentityPoolID };
        getIdPayload.Logins = {};
        getIdPayload.Logins[provider] = token;
        const getId = new GetIdCommand(getIdPayload);
        this.identityId = (await this.cognitoIdentities.send(getId)).IdentityId;
        
        const getCredsPayload = { IdentityId: this.identityId };
        getCredsPayload.Logins = {};
        getCredsPayload.Logins[provider] = token;
        
        const getCreds = new GetCredentialsForIdentityCommand(getCredsPayload);
        const getCredsResponse = await this.cognitoIdentities.send(getCreds);
        this.credentials = getCredsResponse.Credentials;
        this.identityId = getCredsResponse.IdentityId;
        ls.set(STORAGE_KEY_CREDENTIALS, getCredsResponse);

        const api = new API(this);
        api.apiUrl = new URL(Exports.AppStack.auth);
        api.initApi();
        api.request();
    }

    /**
     * @public
     * Initiates a custom authentication session for a phone number or email. This
     * will send a confirmation code either via SMS or Email that will need to be verified. If a user is not registered
     * the sign-up flow will be called, a user will be created, and the resulting {Promise} will be returned e.g. Logged in
     * when using CUSTOM_AUTH/SMS (recommended), or confirmation challenge for other flows. 
     * @param {string} user 
     * @param {string} password Password uses a default/dummy password for custom auth
     * @param {string} authFlow The AuthFlow to use to authenticate, @see AUTH_FLOW for supported methods
     * @returns {Promise<string>} Either an error message or Session token to be used in challenge response
     */
    async initAuth(
        user, 
        password = this.password, 
        authFlow = this.AUTH_FLOW.CUSTOM_AUTH ) {
        const cmd = new InitiateAuthCommand({
            AuthFlow: authFlow,
            AuthParameters: {
                USERNAME: user,
                PASSWORD: password
            },
            ClientId: this.clientId
        });
        return this.cognitoUserPools.send(cmd)
            .then((response) => {
                this.challengeSession = response.Session;
                return response.Session;
            }).catch((error) => {
                if (error.__type === 'UserNotFoundException') {
                    return this.signUp(user, password, authFlow);
                } else {
                    return error.message;
                }
            });
    }

    /**
     * Runs a sign-up flow, this can generally be not called and part of sign-up unless more attributes are required.
     * It's recommended to use simple login/sign-up e.g. CUSTOM_AUTH w/SMS, or Username/Password first, then update attributes
     * after user is signed up for the the best user/autnentication experience.
     * @param {string} user 
     * @param {string} password Password uses a default/dummy in the case of CUSTOM_AUTH
     * @returns {Promise} re-runs the initiate auth for the given user
     */
    async signUp(
        user, 
        password = this.password, 
        authFlow = this.AUTH_FLOW.CUSTOM_AUTH ) {
        const cmd = new SignUpCommand({
            Username: user,
            Password: password,
            UserAttributes: (authFlow === this.AUTH_FLOW.CUSTOM_AUTH) ? [{Name: "phone_number",Value: user}] : [],
            ClientId: this.clientId
        });
        await this.cognitoUserPools.send(cmd);
        return this.initAuth(user);
    }

    /**
     * Confirms a confirmation code sent via the SignUp command
     * @param {string} user 
     * @param {string} code 
     */
    async confirm(user, code) {
        if (this.challengeSession) {
            return this.verify(user, code);
        } else {
            const cmd = new ConfirmSignUpCommand({
                ClientId: this.clientId,
                Username: user,
                ConfirmationCode: code
            });
            await this.cognitoUserPools.send(cmd);
            this.initAuth(user);
        }
    }

    /**
     * Verify a confirmation code (challenge) that was sent
     * @param {string} user 
     * @param {string} code 
     * @returns {Promise<object>} a promise containing the access and ID tokens
     */
    async verify(user, code) {
        const cmd = new RespondToAuthChallengeCommand({
            ChallengeName: "CUSTOM_CHALLENGE",
            ClientId: this.clientId,
            ChallengeResponses: {
                "USERNAME": user,
                "ANSWER":code
            },
            Session: this.challengeSession
        });
        try {
            const result = await this.cognitoUserPools.send(cmd);
            this.access = result.AuthenticationResult;
            // re-retrieve credentials for this login
            this.init();
            return result;
        } catch (e) {
            return e.message;
        }
    }


}

export { API, Auth, Config };
