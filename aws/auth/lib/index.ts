import { Construct } from 'constructs';
import { 
  AccountRecovery, 
  Mfa, 
  UserPool, 
  UserPoolClient, 
  VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { 
  IdentityPool, 
  UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import { RemovalPolicy } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as Config from './config.json';

export interface AuthProps {}

export class Auth extends Construct {

  userPool: UserPool;
  userPoolClient: UserPoolClient;
  identityPool: IdentityPool;
  idps:any = Config.IdentityPoolAuthenticationProviders;

  constructor(scope: Construct, id: string, props: AuthProps = {}) {
    super(scope, id);

    const preSignupFn = new lambda.Function(this, `lambdaTriggerPreSignUp`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'presignup.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'triggers/')),
    });

    const createAuthChallengeFn = new lambda.Function(this, `lambdaTriggerCreateAuthChallenge`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'createauthchallenge.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'triggers/')),
    });

    const defineAuthChallengeFn = new lambda.Function(this, `lambdaTriggerDefineAuthChallenge`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'defineauthchallenge.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'triggers/')),
    });

    const verifyAuthChallengeResponseFn = new lambda.Function(this, `lambdaTriggerVerifyAuthChallengeResponse`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'verifyauthchallengeresponse.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'triggers/')),
    });

    this.userPool = new UserPool(this, `authn-userpool`, {
      lambdaTriggers: {
        preSignUp: preSignupFn,
        createAuthChallenge: createAuthChallengeFn,
        defineAuthChallenge: defineAuthChallengeFn,
        verifyAuthChallengeResponse: verifyAuthChallengeResponseFn
      },
      signInAliases: { username: true, email: true },
      autoVerify: { email: true, phone: true },
      removalPolicy: RemovalPolicy.DESTROY, 
      keepOriginal: {
        email: true,
        phone: true,
      },
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email',
        emailBody: 'Thanks for signing up! {##Verify Email##}',
        emailStyle: VerificationEmailStyle.LINK,
        smsMessage: 'Thanks for signing up! Your verification code is {####}',
      },
      userInvitation: {
        emailSubject: 'Invite to join',
        emailBody: 'Hello {username}, you have been invited to join! Your temporary password is {####}',
        smsMessage: 'Hello {username}, your temporary password is {####}',
      },
    });

    createAuthChallengeFn.role?.attachInlinePolicy(new Policy(this, 'userpool-policy', {
      statements: [new PolicyStatement({
        actions: ['sns:Publish'],
        resources: [this.userPool.userPoolArn],
      })],
    }));

    this.userPoolClient = new UserPoolClient(this, 'customer-app-client', {
      userPool: this.userPool,
      authFlows: {
        custom: true,
        userPassword: false,
        userSrp: true,
      },
    });

    let authProviders:any = {
      userPools: [
        new UserPoolAuthenticationProvider({
          userPool: this.userPool,
          userPoolClient: this.userPoolClient
        })
      ]
    };

    // Check for external identity providers configuration
    try {
      let idps:any = Config.IdentityPoolAuthenticationProviders;
      for (let key in idps) {
        if (key) {
          authProviders[key] = idps[key];
        }
      }
    } catch (error) {} 

    this.identityPool = new IdentityPool(this, `authz-identitypool`, {
      identityPoolName: id,
      allowUnauthenticatedIdentities: true,
      authenticationProviders: authProviders,
    });
  }
}