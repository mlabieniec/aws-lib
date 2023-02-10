import Sigv4Client from './sigv4';
import HttpClient from './http';
import Util from './util';
const utils = new Util();

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
        this.pathComponent = this.pathComponent = invokeUrl.substring(this.endpoint.length);
        this.sigV4ClientConfig = {
            ...config,
            serviceName: 'execute-api',
            endpoint: this.endpoint,
        };

        let authType = 'NONE';
        if (this.sigV4ClientConfig.accessKey !== undefined && this.sigV4ClientConfig.accessKey !== '' && this.sigV4ClientConfig.secretKey !== undefined && this.sigV4ClientConfig.secretKey !== '') {
            authType = 'AWS_IAM';
        }
        this.simpleHttpClientConfig = {
            endpoint: this.endpoint,
            defaultContentType: config.defaultContentType,
            defaultAcceptType: config.defaultAcceptType
        };

        this.sigv4client = new Sigv4Client(this.sigV4ClientConfig);
        //this.httpclient = new HttpClient(this.simpleHttpClientConfig);
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
        request.headers = utils.mergeInto(request.headers, additionalParams.headers);
        request.queryParams = utils.mergeInto(request.queryParams, additionalParams.queryParams);

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

        console.log(dataOptionsRequest);
        
        return this.request(dataOptionsRequest, authType, additionalParams, config.apiKey);
    }
}

export {
    RESTClient
}