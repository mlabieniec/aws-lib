const aws = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });
const table = process.env.USER_DB_TABLE;

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Context: ', JSON.stringify(context, null, 2));
    var res ={
        "statusCode": 200,
        "headers": {
            "Content-Type": "*/*",
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        }
    };
    res.body = "";
    return callback(null, res);
}