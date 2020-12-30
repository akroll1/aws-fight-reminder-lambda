'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const dynamo = new AWS.DynamoDB.DocumentClient();
const moment = require('moment-timezone');

async function getAllReminders(ExclusiveStartKey) {
  const { Items, LastEvaluatedKey } = await dynamo.scan({
    TableName: process.env.REMINDER_TABLE,
    AttributesToGet: [ 'scorecardName','fighterA','fighterB','phone_number','time' ],
    ExclusiveStartKey
  }).promise();
  // console.log('Items: ',Items);
  const reminders = Items.map(reminder => reminder);

  // when no more items, LastKeyEvaluated is empty...
  if(LastEvaluatedKey) {
    reminders.push(...await getAllReminders(LastEvaluatedKey));
  }
  return reminders;
}
async function sendReminders(reminder, callback){
  const {scorecardName, fighterA, fighterB, phone_number, time} = reminder;
  console.log(time)
  console.log('t: ',Math.round(moment.duration(moment(time).tz('America/New_York').utc().diff(moment(new Date).utc())).asMinutes()) === 1)

  if(Math.round(moment.duration(moment(time).tz('America/New_York').utc().diff(moment(new Date).utc())).asMinutes()) > 1){

      const message = `Fantasy Pro Boxing Fight Reminder. ${scorecardName} starts at 9PM EST.`

    const params = {
      Message: message,
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
    })
  }
}
module.exports.publish = async (event, context, callback) => {
    console.log('publish route');
    const reminders = await getAllReminders();
    await Promise.all(
      reminders.map(reminder => sendReminders(reminder, callback))
    )
}