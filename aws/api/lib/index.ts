import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { AuthorizationType, Cors } from 'aws-cdk-lib/aws-apigateway';

export interface ApiProps {
  region?: string;
}

export class API extends Construct {

  gateway:apigateway.SpecRestApi;
  apiFn:lambda.Function;

  constructor(scope: Construct, id: string, props: ApiProps = {}) {
    super(scope, id);
    
    this.apiFn = new lambda.Function(this, 'LambdaExpress', {
      // if a functionName is specified it will be a static value
      // in the console. See note below on this as it can cause problems
      // and conflicts when re-deploying with the CDK
      //functionName: 'OpenAPILambdaApiFunction',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      memorySize: 512,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_DAY,
      code: lambda.Code.fromAsset(path.join(__dirname, 'function/')),
    });

    this.apiFn.addPermission('API GW Permissions', {
      principal: new ServicePrincipal('apigateway.amazonaws.com')
    });

    /*
     * You can use the included, or similar `api.yaml` file to define and deploy
     * API Gateway REST APIs as well with the below code. The only caveat to this is the Lambda 
     * Function name needs to be a static value. This can cause conflicts when deploying, updating the
     * stack since the function name is not unique and will fail when trying to create a new one
     * prior to deleting the old one. You can avoid this by deleting the function from the console
     * prior to updating via CDK.
    this.gateway = new apigateway.SpecRestApi(this, 'LambdaExpressAPI', {
      apiDefinition: apigateway.ApiDefinition.fromAsset(path.join(__dirname, 'api.yaml'))
    });
    */

    /**
     * Another option is to override the unique logical ID of the function
     * and reference this as uri: Fn::Sub in the api.yml. However this does not
     * seem to work in node.js deployed functions for some reasons.
     */
    //const lambdaFn = this.apiFn.node.defaultChild as lambda.CfnFunction;
    //lambdaFn.overrideLogicalId("APILambda");

    this.gateway = new apigateway.LambdaRestApi(this, 'LambdaExpressAPI', {
      handler: this.apiFn,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
      },
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM
      }
    });
  }
}
