#!/bin/bash

aws apigateway get-sdk \
        --rest-api-id {get this from the cloudformation outputs after deployment} \
        --stage-name prod \
        --sdk-type javascript \
        ~/my-aws-app-client-sdk.zip