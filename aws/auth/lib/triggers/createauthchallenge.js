/* tslint:disable */
/* eslint-disable */
const AWS = require('aws-sdk');
exports.handler = (event, context, callback) => {
  //Create a random number for otp
  const challengeAnswer = Math.random().toString(10).substr(2, 6);
  const phoneNumber = event.request.userAttributes.phone_number;
  //sns sms
  const sns = new AWS.SNS({ region: 'us-east-1' });
  sns.publish(
    {
      Message: `${challengeAnswer} is your login code. If you didn't request this code by trying to log in on another device, simply ignore this message.`,
      PhoneNumber: phoneNumber,
      MessageStructure: 'string',
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'APP',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    },
    function (err, data) {
      if (err) {
        console.log(err.stack);
        console.log(data);
        return;
      }
      return data;
    }
  );
  //set return params
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = challengeAnswer;
  event.response.challengeMetadata = 'CUSTOM_CHALLENGE';
  callback(null, event);
};