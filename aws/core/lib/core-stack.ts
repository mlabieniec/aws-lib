import { 
  App,
  Stack, 
  StackProps,
  NestedStack,
  CfnOutput,
} from 'aws-cdk-lib';
import { PolicyStatement,Effect, Policy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Chance } from 'chance';
import { Auth } from '../../auth/lib';
import { API } from '../../api/lib';
import { Data } from '../../data/lib';

const c = new Chance();
const guid = c.guid();

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, 'AppStack', props);

    const authStack = new AuthStack(this, 'authStack');
    const apiStack = new ApiStack(this, 'apiStack');
    const dataStack = new DataStack(this, 'dataStack');

    authStack.auth.identityPool.authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'execute-api:*'
      ],
      resources: [apiStack.api.gateway.arnForExecuteApi()]
    }));

    authStack.auth.identityPool.authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'kinesis:Get*',
        'kinesis:DescribeStreamSummary'
      ],
      resources: [dataStack.data.stream.streamArn]
    }));
    authStack.auth.identityPool.authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'kinesis:ListStreams'
      ],
      resources: ['*']
    }));

    // API Function is able to Read from the users table and CRUD on the data table
    apiStack.api.apiFn.role?.attachInlinePolicy(new Policy(this, 'apiFunctionPolicyUserRead', {
      statements: [new PolicyStatement({
        actions: [
          "dynamodb:BatchGetItem",
          "dynamodb:Describe*",
          "dynamodb:List*",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ],
        resources: [
          dataStack.data.dbUser.tableArn
        ],
      })],
    }));
    apiStack.api.apiFn.role?.attachInlinePolicy(new Policy(this, 'apiFunctionPolicyDataRW', {
      statements: [new PolicyStatement({
        actions: [
          "dynamodb:GetItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:GetRecords",
          "dynamodb:DeleteItem",
          "dynamodb:Query"
        ],
        resources: [
          dataStack.data.dbData.tableArn
        ],
      })],
    }));

    // AuthFn can PUT on the Users table
    apiStack.api.apiFn.role?.attachInlinePolicy(new Policy(this, 'authFunctionPolicyDataW', {
      statements: [new PolicyStatement({
        actions: [
          "dynamodb:PutItem"
        ],
        resources: [
          dataStack.data.dbUser.tableArn
        ],
      })],
    }));

    apiStack.api.authFn.addEnvironment(
      'DB_USER_TABLE', dataStack.data.dbUser.tableName
    );

    apiStack.api.apiFn.addEnvironment(
      'DB_USER_TABLE',dataStack.data.dbUser.tableName
    );

    apiStack.api.apiFn.addEnvironment(
      'DB_DATA_TABLE',dataStack.data.dbData.tableName
    );
    apiStack.api.authFn.addEnvironment(
      'REGION', this.region
    );

    apiStack.api.apiFn.addEnvironment(
      'REGION', this.region
    );

    new CfnOutput(this, 'id', {
      value: guid
    });

    new CfnOutput(this, 'region', {
      value: this.region
    });

    new CfnOutput(this, 'cognitoUserPoolClientID', {
      value: authStack.auth.userPoolClient.userPoolClientId
    });

    new CfnOutput(this, 'cognitoIdentityPoolID', {
      value: authStack.auth.identityPool.identityPoolId
    });
    
    for(let idp in authStack.auth.idps) {
      if (idp) {
        let key = Object.keys(authStack.auth.idps[idp])[0];
        new CfnOutput(this, idp, {
          value: authStack.auth.idps[idp][key]
        });
      }
    }

    new CfnOutput(this, 'cognitoUserpoolID', {
      value: authStack.auth.userPool.userPoolId
    });
    
    new CfnOutput(this, 'data', {
      value: apiStack.api.gateway.deploymentStage.urlForPath('/data')
    });

    new CfnOutput(this, 'auth', {
      value: apiStack.api.gateway.deploymentStage.urlForPath('/auth')
    });
  }
}

class AuthStack extends NestedStack {
  auth: Auth;
  constructor(scope: Construct, id: string) {
    super(scope,id);
    this.auth = new Auth(this, id);
  }
}

class ApiStack extends NestedStack {
  api: API;
  constructor(scope:Construct, id: string) {
    super(scope,id);
    this.api = new API(this,id, {
      region: this.region
    });
  }
}

class DataStack extends NestedStack {
  data:Data;
  constructor(scope:Construct, id:string) {
    super(scope,id);
    this.data = new Data(this,id, {});
  }
}

new CoreStack(new App(), guid);
