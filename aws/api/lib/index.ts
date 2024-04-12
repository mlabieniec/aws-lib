import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Policy, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { AuthorizationType, Cors, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

export interface ApiProps {
  region?: string;
}

export class API extends Construct {

  gateway:apigateway.LambdaRestApi;
  apiFn:lambda.Function;
  authFn:lambda.Function;

  constructor(scope: Construct, id: string, props: ApiProps = {}) {
    super(scope, id);
    
    /**
     * This function will handle requests via Express for all data
     * related functions, and should be added to the `authenticated` role
     */
    this.apiFn = new lambda.Function(this, 'LambdaData', {
      // if a functionName is specified it will be a static value
      // in the console. See note below on this as it can cause problems
      // and conflicts when re-deploying with the CDK. However if you are
      // using the Open API definition you will need to hard code a name here
      // just ensure it's deleted before re-deploying (via the console or CLI)
      // and that it matches the name within the api.yaml file
      //functionName: 'OpenAPILambdaApiFunction',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      memorySize: 512,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_DAY,
      code: lambda.Code.fromAsset(path.join(__dirname, 'data/')),
    });

    this.apiFn.addPermission('API GW Permissions', {
      principal: new ServicePrincipal('apigateway.amazonaws.com')
    });

    /**
     * This function will handle Authorization requests that come from
     * third party authentication providers like google
     */
    this.authFn = new lambda.Function(this, 'LambdaAuth', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      memorySize: 512,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_DAY,
      code: lambda.Code.fromAsset(path.join(__dirname, 'auth/')),
    });

    this.authFn.addPermission('API GW Permissions', {
      principal: new ServicePrincipal('apigateway.amazonaws.com')
    });

    this.apiFn.role?.attachInlinePolicy(new Policy(this, 'apiFunctionPolicyLogs', {
      statements: [new PolicyStatement({
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        resources: ['*'],
      })],
    }));

    this.authFn.role?.attachInlinePolicy(new Policy(this, 'authFunctionPolicyLogs', {
      statements: [new PolicyStatement({
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        resources: ['*'],
      })],
    }));

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
    this.gateway = new apigateway.RestApi(this, 'AppApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS, // this should be updated to only include the app domain in production
        allowHeaders: ['*'],
        allowMethods: Cors.ALL_METHODS,
      },
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM
      }
    });
    
    const authRes = this.gateway.root.addResource('auth',{
      defaultIntegration: new LambdaIntegration(this.authFn),
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS, // this should be updated to only include the app domain in production
        allowHeaders: ['*'],
        allowMethods: Cors.ALL_METHODS,
      }
    });
    const dataRes = this.gateway.root.addResource('data', {
      defaultIntegration: new LambdaIntegration(this.apiFn),
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS, // this should be updated to only include the app domain in production
        allowHeaders: ['*'],
        allowMethods: Cors.ALL_METHODS,
      },
    });
    authRes.addMethod('ANY');
    dataRes.addMethod('ANY');
  }
}
