import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

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
      functionName: 'OpenAPILambdaApiFunction',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      memorySize: 512,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_DAY,
      code: lambda.Code.fromAsset(path.join(__dirname, 'function/')),
    });

    //const lambdaFn = this.apiFn.node.defaultChild as lambda.CfnFunction;
    //lambdaFn.overrideLogicalId("APILambda");

    this.apiFn.addPermission('API GW Permissions', {
      principal: new ServicePrincipal('apigateway.amazonaws.com')
    });

    this.gateway = new apigateway.SpecRestApi(this, 'LambdaExpressAPI', {
      apiDefinition: apigateway.ApiDefinition.fromAsset(path.join(__dirname, 'api.yaml'))
    });
    
    const stageName = this.gateway.deploymentStage.stageName;
    this.invokeUrl = `https://${this.gateway.restApiId}.execute-api.${props.region}.amazonaws.com/${stageName}`;

  }
}
