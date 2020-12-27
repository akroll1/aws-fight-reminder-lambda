'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();

module.exports.publish = (event, context, callback) => {
    console.log('publish route');
    // const data = JSON.parse(event.body);
    const message = `Fantasy Pro Boxing Fight Reminder.
    This is now on AWS, the last one was on Twilio.`
    
    const params = {
        Message: message,
        // TopicArn: process.env.TOPIC_ARN,
        // Subject: 'FPB Fight Reminder',
        PhoneNumber: `+14805298195`
    };

    sns.publish(params, (err) => {
        if(err){
            console.error(err);
            callback(null, {
              statusCode: 501,
              headers: { 'Content-Type': 'text/plain' },
              body: `Couldn\'t send due to an internal error. Please try again later.`,
            });
        }
        const response = {
            statusCode: 200,
            body: JSON.stringify({message: `Successfully sent!`})
        };
        callback(null, response);
    });
}