//const dns = require('dns');
const https = require('https');
const fs = require('fs');
const path = require('path');

function createCloudTrailMessage(userId, event) {
  let detail = event.detail;
  return JSON.stringify({
    event: {
      node: event.account + '-' + detail.awsRegion,
      tag: 'CloudTrailEvent',
      summary: 'The user ' + userId + ' triggered event ' + detail.eventName + ' (' + detail.eventType + ') via ' + detail.eventSource + '.',
      severity: 1,
    },
  });
}

function createEc2InstanceStateChangeMessage(event) {
  return JSON.stringify({
    event: {
      node: event.account + '-' + event.region,
      tag: 'Ec2 State Change',
      summary: 'The state of instance ' + event.detail['instance-id'] + ' has changed to ' + event.detail.state + ' at ' + event.time + '.',
      severity: 1,
    },
  });
}

function createGuardDutyEventMessage(event) {
  var result = [];
  event.detail.findings.forEach(function (finding) {
    var sev = finding.severity > 5 ? 5 : finding.severity;
    result.push(
      JSON.stringify({
        event: {
          node: event.account + '-' + event.region,
          tag: event['detail-type'],
          summary: finding.description,
          severity: sev,
        },
      })
    );
  });
  return result;
}

function createSecurityHubEventMessage(event) {
  var result = [];
  event.detail.findings.forEach(function (finding) {
    if (finding.compliance != 'PASSED') {
      var sev = finding.severity > 5 ? 5 : finding.severity.normalized;
      result.push(
        JSON.stringify({
          event: {
            node: event.account + '-' + event.region,
            tag: event['detail-type'],
            summary: finding.description,
            severity: sev,
          },
        })
      );
    }
  });
  return result;
}
function createAWSConfigEventMessage(event) {
  let configItem = event.detail.configurationItem;
  return JSON.stringify({
    event: {
      node: event.account + '-' + event.region,
      tag: 'AWSConfig',
      summary:
        'A resource called ' +
        configItem.resourceName +
        ' of type ' +
        configItem.resourceType +
        ' recorded a change type of: ' +
        event.detail.configurationItemDiff.changeType,
      severity: 1,
    },
  });
}

function getUserId(event) {
  var userId = 'aws service';
  if ('userIdentity' in event.detail) {
    if ('userName' in event.detail.userIdentity) {
      userId = event.detail.userIdentity.userName + ' [' + event.detail.userIdentity.principalId + ']';
    } else {
      userId = event.detail.userIdentity.principalId;
    }
  }
  return userId;
}

exports.lambdaHandler = function (event, context, callback) {
  try {
    //console.log("Event Received: " + JSON.stringify(event, null, 2));

    // Note: The detail is different, depending on the source of the message
    // most of the fields are the same, but it could cause errors if extracting specialised data:
    switch (event['detail-type']) {
      case 'AWS API Call via CloudTrail':
        let userId = getUserId(event);
        var data = [createCloudTrailMessage(userId, event)];
        break;
      case 'EC2 Instance State-change Notification':
        var data = [createEc2InstanceStateChangeMessage(event)];
        break;
      case 'GuardDuty Finding':
        var data = createGuardDutyEventMessage(event);
        break;
      case 'Security Hub Findings':
      case 'Security Hub Findings - Imported':
        var data = createSecurityHubEventMessage(event);
        break;
      case 'Config Configuration Item Change':
        var data = [createAWSConfigEventMessage(event)];
        break;
      default:
        console.log('Event received that has no handler: ' + JSON.stringify(event, null, 2));
    }

    if (data) {
      data.forEach(function (eData) {
        const api_url = process.env.API_URL;
        const options = {
          method: 'POST',
          headers: {
            'X-Api-Token': process.env.API_TOKEN,
            'Content-Type': 'application/json',
            'Content-Length': eData.length,
          },
        };

        console.log(JSON.stringify(options, null, 2));

        const req = https.request(api_url, options, (res) => {
          console.log(`statusCode: ${res.statusCode}`);

          res.on('data', (d) => {
            // console.log("Return data: " + d);
            process.stdout.write(d);
          });
        });

        req.on('error', (error) => {
          console.error(error);
        });

        req.write(eData);
        req.end();
      });
    }
  } catch (error) {
    console.log('Exception: ' + error);
    console.log('Event Received: ' + JSON.stringify(event, null, 2));
  }
};
