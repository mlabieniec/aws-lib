# AWS Lib

A complete (tiny) solution for passwordless authentication and serverless APIs on AWS, backed by customizable CDK constructs and Open API definition.

## Usage

1. Build/deploy the CDK app (ensure you have the CDK and credentials setup on your machine)
```
cd aws && npm i && npm run deploy
```
2. Build and Run the React sample
```
cd ../sample-react && npm i && npm start
```
3. Edit/Customize/Repeat


## Features

* Simple custom/**passwordless** Authentication
* SMS OTP out-of-the-box powered by Amazon SNS
* Credentials managed by the aws-sdk V3 client modules. Install/Use any other service you want (Add IAM Permissions to Authenticated or Guest roles and re-deploy with CDK)
* Simple serverless, Lambda proxy Rest API defined by Customizable **Open API** Spec with SigV4 signing built-in
* Generated configuration from Customizable CDK constructs
* Encrypted localstorage for saved state/login
* Tiny Size: Uncompressed **10.8 kB**, Minified **5.09 kB**, Gzipped **2.12 kB**, Brotlied **1.86 kB**

## Sample Lib Usage
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