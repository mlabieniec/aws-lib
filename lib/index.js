import Exports from './config.json';
import { 
    CognitoIdentityClient, 
    GetCredentialsForIdentityCommand, 
    GetIdCommand 
} from "@aws-sdk/client-cognito-identity";

import { 
    CognitoIdentityProviderClient, 
    ConfirmSignUpCommand, 
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
    SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";

import axios from 'axios';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import ls from 'localstorage-slim';
import encUTF8 from 'crypto-js/enc-utf8';
import AES from 'crypto-js/aes';

const API_URL = Exports.AppStack.data;
const STORAGE_KEY_CREDENTIALS = 'credentials';
const STORAGE_KEY_AUTH = 'access';

export class Config {

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

export class API {

    // Rest API Endpoint
    apiUrl = new URL(API_URL);

    // signing for API calls
    sigv4;

    // an authenticated Auth instance
    auth;

    constructor(auth) {
        this.auth = auth;
        //this.initApi();
    }

    async initApi() {
        this.sigv4 = new SignatureV4({
            service: 'execute-api',
            region: Exports.AppStack.region,
            credentials: {
              accessKeyId: this.auth.credentials.AccessKeyId,
              secretAccessKey: this.auth.credentials.SecretKey,
              sessionToken: this.auth.credentials.SessionToken,
            },
            sha256: Sha256,
          });
    }

    async request(apiUrl = this.apiUrl, method = 'POST', body = {}) {
        const signed = await this.sigv4.sign({
            hostname: apiUrl.host,
            path: apiUrl.pathname,
            protocol: apiUrl.protocol,
            headers: {
                'Content-Type': 'application/json'
            },
          });
        try {
            const { data } = await axios({
              ...signed,
              url: apiUrl.href,
              method: method,
              data: JSON.stringify(body)
            });
            console.log('Successfully received data: ', data);
            return data;
        } catch (error) {
            console.log('An error occurred', error);
            throw error;
        }
    }
}

export class Auth {

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
        })
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