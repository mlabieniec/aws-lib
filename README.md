# AWS Lib

A complete (tiny) solution for passwordless authentication and serverless APIs on AWS, backed by customizable CDK constructs and Open API definition.

* Uncompressed **10.8 kB**
* Minified **5.09 kB**
* Gzipped **2.12 kB**
* Brotlied **1.86 kB**

### Supports

 - Authentication with your chosen Identity Provider via Amazon Cognito Federated Identities (Temporary credentials via SES)
 - Authorization via Cognito / SES defined by CDK with sane/best practice defaults for passwordless / SMS authentication
 - Serverless REST API via Amazon API Gateway / Lambda configurable with optional Open API schema
 - (Coming Soon) Data stored via Amazon DynamoDB
 - (Coming Soon) Object Storage via Amazon S3

## Setup
This project uses the AWS CDK, so ensure that is installed/configured for your AWS account first. The only configuration currently needed to be added by you is adding a `config.json` file to `aws/auth/lib/config.json` (see `sample-config` for example usage) with your external IDP configuration. The configuration of this file should match the required data that the CDK needs to instantiate 3rd party IDPs. For example:

```json
{
    "IdentityPoolAuthenticationProviders": {
        "google": {
            "clientId": "your-client-id.apps.googleusercontent.com"
        },
        "facebook": {} // Don't include these as empty or the CDK stack will throw errors
    }
}

```

The structure of this JSON directly maps to the CDKs `IdentityPoolAuthenticationProviders` API and can be included as such per provider:
https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-cognito-identitypool-alpha.IdentityPoolAuthenticationProviders.html

## Usage

1. Build/deploy the CDK app (ensure you have the CDK and credentials setup on your machine). Ensure you have created a `aws/auth/lib/config.json` file as outlined above (if no providers, just leave it blank with an empty object `{}`)

```bash
cd aws && npm i && npm run deploy
```

> NOTE: If you are using an AWS CLI profile, the NPM script doesn't include the `--profile` argument. So, if you have profiles enabled, run the deploy directly from `cd aws/core`: `cdk deploy --outputs-file ../../lib/config.json --yourProfileName`

2. Build and Run the React sample
```bash
cd ../sample-react && npm i && npm start
```

3. (optional) If you want to develop within the library while running in the sample react app, run a `start` command within the `lib` directory, this will automatically watch for `lib` changes and refresh the linked lib within the sample app, triggering an auto reload there as well.

```bash
cd lib && npm start
```

If you run into dependency errors, you might need to link the `lib` into the `sample-react` app's modules, especially if you are on windows. If you get a bunch of dependency errors when running the sample, then run the following:

```bash
cd lib && npm link
cd ../sample-react && npm link aws-lib
```

* The front-end library uses a configuration file that is outputed via the CDK. It's a `config.json` file and contains cloudformation outputs that the front-end library will consume in order to call AWS. The location of the config file is hard coded to resolve to the `lib` by default e.g. `"aws-lib: file:lib"` within the `sample-react/package.json` file. So, if you move things around, ensure you are outputing that `config.json` file to `lib/config.json` (you can do this by modifying the `aws/core/package.json`'s `deploy` script).

## Features

* Simple custom/**passwordless** Authentication
* SMS OTP out-of-the-box powered by Amazon SNS
* Credentials managed by the aws-sdk V3 client modules. Install/Use any other service you want (Add IAM Permissions to Authenticated or Guest roles and re-deploy with CDK)
* Simple serverless, Lambda proxy Rest API defined by Customizable **Open API** Spec with SigV4 signing built-in
* Generated configuration from Customizable CDK constructs
* Encrypted localstorage for saved state/login
* Tiny Size: Uncompressed **10.8 kB**, Minified **5.09 kB**, Gzipped **2.12 kB**, Brotlied **1.86 kB**

## Sample Client Lib Usage

```javascript
import { Auth, API } from 'aws-lib';

const auth = new Auth();

function login(phone_number_with_country_code) {
    // couple this up with 
    auth.initAuth(phone_number_with_country_code);
}

function verify(phone, code) {
    auth.verify(phone, code);
}

function makeApiRequest() {
    // pass in an authenticated `auth` instance for SigV4 signed requests
    // OR don't for unauthenticated/public requests
    const api = new API(auth);
    const myData = api.request();
}

```