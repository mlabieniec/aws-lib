import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');

export interface ApiProps {
  region?: string;
}

export class API extends Construct {

  gateway:apigateway.SpecRestApi;
  apiFn:lambda.Function;
  invokeUrl: string;

  constructor(scope: Construct, id: string, props: ApiProps = {}) {
    super(scope, id);
    
    this.apiFn = new lambda.Function(this, 'OpenAPILambdaApiFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      functionName: 'OpenAPILambdaApiFunction',
      code: lambda.Code.fromAsset(path.join(__dirname, 'function/')),
    });

    this.gateway = new apigateway.SpecRestApi(this, `api-${id}`, {
      apiDefinition: apigateway.ApiDefinition.fromAsset(path.join(__dirname, 'api.yaml'))
    });

    const stageName = this.gateway.deploymentStage.stageName;
    this.invokeUrl = `https://${this.gateway.restApiId}.execute-api.${props.region}.amazonaws.com/${stageName}`;

  }
}
