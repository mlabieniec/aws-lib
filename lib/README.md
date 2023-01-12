# AWS Lib

A simple library for passwordless (Custom Auth) authentication (Cognito User and Identity Pools) and a serverless API (API Gateway+Lambda) using Open API schema. Configuration is generated via the `../aws` CDK application and contains resources used by this lib.

## Usage
This module can be included as a dependency of another via `import`. Just link locally (see ../sample-react). To build/bundle:

```bash
npm i && npm run build
npm link
```

Then in your project run:

```bash
npm link aws-lib
```

Keep in mind the cloudformation outputs from `../aws` CDK project will be outputed to `./config.json` and included in the build/dist file for you. So if you change the backend, you'll need to run the above again.

## Features

* Simple custom/**passwordless** Authentication
* SMS OTP out-of-the-box powered by Amazon SNS
* Credentials managed by the aws-sdk V3 client modules. Install/Use any other service you want (Add IAM Permissions to Authenticated or Guest roles and re-deploy with CDK)
* Simple serverless, Lambda proxy Rest API defined by Customizable **Open API** Spec with SigV4 signing built-in
* Generated configuration from Customizable CDK constructs
* Encrypted localstorage for saved state/login
* Tiny Size: Uncompressed **10.8 kB**, Minified **5.09 kB**, Gzipped **2.12 kB**, Brotlied **1.86 kB**

## Sample Usage
```
import { Auth, API } from 'aws-lib';

const auth = new Auth();

// send in an auth instance for authenticated/signed APIs e.g. AWS_IAM authentication/authorization
const api = new API(auth);

function login(phone_number_with_country_code) {
    // couple this up with 
    auth.initAuth(phone_number_with_country_code);
}

function verify(phone, code) {
    auth.verify(phone, code);
}

function setupAuthView() {
    // Initialize the API with authenticated credentials once logged in.
    api.initApi();
}

```