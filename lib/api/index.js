import Sigv4Client from './sigv4';
import HttpClient from './http';

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

        let authType = 'NONE';
        if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
            authType = 'AWS_IAM';
        }
        this.simpleHttpClientConfig = {
            endpoint: endpoint,
            defaultContentType: config.defaultContentType,
            defaultAcceptType: config.defaultAcceptType
        };

        this.sigv4client = new Sigv4Client(this.sigV4ClientConfig);

        this.httpclient = new HttpClient(this.simpleHttpClientConfig);
    }

    request(request, authType, additionalParams, apiKey) {
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
            this.sigv4client.makeRequest(request);
        } else {
            this.httpclient.makeRequest(request);
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

export {
    RESTClient
}