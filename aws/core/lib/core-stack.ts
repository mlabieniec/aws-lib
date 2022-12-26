import { 
  App,
  Stack, 
  StackProps, 
  NestedStackProps, 
  NestedStack,
  CfnOutput,
} from 'aws-cdk-lib';
import { PolicyStatement,Effect } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Chance } from 'chance';
import { Auth } from '../../auth/lib';
import { API } from '../../api/lib';

const c = new Chance();
const guid = c.guid();

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, 'AppStack', props);

    const authStack = new AuthStack(this, `authStack-${guid}`);
    const apiStack = new ApiStack(this,`apiStack-${guid}`);

    // Add Execute permissions to the authenticated role 
    const apiArn = apiStack.api.gateway.arnForExecuteApi();
    authStack.auth.identityPool.authenticatedRole.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['execute-api:*'],
      resources: [apiArn]
    }));

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

    new CfnOutput(this, 'cognitoUserpoolID', {
      value: authStack.auth.userPool.userPoolId
    })

    new CfnOutput(this, 'api', {
      value: apiStack.api.invokeUrl
    });
  }
}

/*
interface nestedStackProps extends NestedStackProps {
  readonly guid: string;
}
*/

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

new CoreStack(new App(), guid);
