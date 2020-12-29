'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.publish = (event, context, callback) => {
    console.log('publish route');
    const data = JSON.parse(event.body);
    let epoch = Math.round(moment.duration(moment(fightTime).tz('America/Phoenix').utc().diff(moment(date).utc())).asMinutes())

    //////////////////////////////////////////////
    const params = {
        TableName: process.env.REMINDER_TABLE,
        Key:{
          showId,
          time
        },
        UpdateExpression: 'SET #questions = list_append(#questions, :data)',
        ExpressionAttributeNames: {
          '#questions':'questions'
        },
        ExpressionAttributeValues: {
          ':data': [data]
        },
        ReturnValues: 'NONE'
      };
      
      dynamoDb.update(params, function(err, result) {
        console.log('res: ',result);
        if (err) {
          console.error(err);
          callback(null, {
            statusCode: err.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t create the question.',
          });
          return;
        }            
        const response = {
          statusCode: 200,
          body: JSON.stringify(result),
        };
        callback(null, response);
      });
    };
    
    //////////////////////////////////////////////
    const message = `Fantasy Pro Boxing Fight Reminder.
    The show starts at 9PM EST.`
    
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