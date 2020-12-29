'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.reminder = (event, context, callback) => {
    console.log('create.reminder route');
    const body = JSON.parse(event.body);
    const {scorecardId, epoch, scorecardName, fighterA, fighterB, phone_number} = body;
    
    const params = {
        TableName: process.env.REMINDER_TABLE,
        Item: {
            scorecardId,
            time: epoch,
            scorecardName,
            fighterA,
            fighterB,
            phone_number
        }
    };

    dynamo.put(params, function(err, result) {
        if (err) {
          console.error(err);
          callback(null, {
            statusCode: err.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t create the reminder.',
          });
          return;
        }            
        const response = {
          statusCode: 200,
          body: JSON.stringify('Successfully saved the reminder.'),
        };
        callback(null, response);
    });   
};