import utils from './util';
const axios = require('axios');
export default class HttpClient {
    constructor(config) {
        let httpConfigClient = {};
        httpConfigClient.accessKey = utils.assertDefined(config.accessKey, 'accessKey');
        httpConfigClient.secretKey = utils.assertDefined(config.secretKey, 'secretKey');
        httpConfigClient.sessionToken = config.sessionToken;
        httpConfigClient.serviceName = utils.assertDefined(config.serviceName, 'serviceName');
        httpConfigClient.region = utils.assertDefined(config.region, 'region');
        httpConfigClient.endpoint = utils.assertDefined(config.endpoint, 'endpoint');
        this.client = httpConfig;
        this.config = config;
    }

    makeRequest = function (request) {
        var verb = utils.assertDefined(request.verb, 'verb');
        var path = utils.assertDefined(request.path, 'path');
        var queryParams = utils.copy(request.queryParams);
        if (queryParams === undefined) {
            queryParams = {};
        }
        var headers = utils.copy(request.headers);
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

        var body = utils.copy(request.body);
        if (body === undefined) {
            body = '';
        }

        var url = this.config.endpoint + path;
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