import { 
  App,
  Stack, 
  StackProps,
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

    // Add Execute permissions if you want to use this API as an authenticated/guest API
    // Rather than with Express views. Otherwise, if using with Express/SSR views, the API
    // needs to be without authentication.
    /*
    const apiArn = apiStack.api.gateway.arnForExecuteApi();
    authStack.auth.identityPool.unauthenticatedRole.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['execute-api:*'],
      resources: [apiArn]
    }));
    */
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
    })

    new CfnOutput(this, 'api', {
      value: apiStack.api.invokeUrl
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

new CoreStack(new App(), guid);
