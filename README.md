# AWS-Events2Panther

This project will quickly and easily allow a user to deploy a lambda function to collect AWS events and send them to Panther via it's web api.

AWS events are either region specific or global, depending on the service. So to get all events to your panther console you will have to deploy this lambda function to each of your accounts and regions that you wish to monitor.

The NodeJS Javascript code can be changed by you if you wish to support different AWS events, and/or send different data as part of the message.

This document will cover:

[[_TOC_]]

## 1. System Design

This system has ben designed to gather AWS events, extract data from them and send it to your Panther console.

![AWS-Events2Panther Design](images/systemDesign.png)

1. The Lambda function is triggered whenever a filter matches an event.
1. It will then format the event data into a Panther json message.
1. Then it will send the message to your Panther console using your private API key.

## 2. Prerequisites

This project is built and uploaded to AWS using the Serverless Application Model:

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html

So to easily build and upload the code to AWS, you must install SAM first.

Note: The AWS SAM tool requires that you have setup the AWS CLI tools first, and that you can use them to access your account:  https://docs.aws.amazon.com/cli/index.html

### 2.1 Installing SAM on Linux

To install SAM, rather than installing the linux version of homebrew (as AWS recommends), you can just get away with:

```pip3 install aws-sam-cli```

## 3. Installation

You will require the following details from your Panther console:

* The API URL of your console, in the format e.g.: `<your console name>`.[app.panther.support](//app.panther.support)`/api/event/create`
* The [API key](//openanswers.github.io/panther-docs/panther/admin#api-keys) from your [console](//openanswers.github.io/panther-docs/panther/console), this will be a long 32 character string of random letters and numbers.

Once you have those details you can build the deployment package and then deploy it to AWS:

```bash
> sam build
> sam deploy --guided
```

Note: _SAM uses the same configuration as the aws cli, so if you use many different accounts, ensure that your profile is pointing to the correct account that you wish to install the collector in._

You will then be asked a series of questions to deploy the code to your account, the process will look similar to this:

```bash
> sam deploy --guided

Configuring SAM deploy
======================

        Looking for samconfig.toml :  Found
        Reading default arguments  :  Success

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [AWS-Events2Panther]: 
        AWS Region [us-east-1]: eu-west-3
        Parameter APIToken []: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        Parameter APIUrl []: https://example.app.panther.support/api/event/create
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [Y/n]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        Save arguments to samconfig.toml [Y/n]: y

        Looking for resources needed for deployment: Not found.
        Creating the required resources...
        Successfully created!

                Managed S3 bucket: aws-sam-cli-managed-default-samclisourcebucket-xxxxxxxxxxxxx
                A different default S3 bucket can be set in samconfig.toml

        Saved arguments to config file
        Running 'sam deploy' for future deployments will use the parameters saved above.
        The above parameters can be changed by modifying samconfig.toml
        Learn more about samconfig.toml syntax at 
        https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-config.html

        Deploying with following values
        ===============================
        Stack name                 : AWS-Events2Panther
        Region                     : eu-west-3
        Confirm changeset          : True
        Deployment s3 bucket       : aws-sam-cli-managed-default-samclisourcebucket-1f8nf3gegbbkw
        Capabilities               : ["CAPABILITY_IAM"]
        Parameter overrides        : {'APIToken': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'APIUrl': 'https://example.app.panther.support/api/event/create'}

Initiating deployment
=====================
Uploading to AWS-Events2Panther/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  128369 / 128369.0  (100.00%)
Uploading to AWS-Events2Panther/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY.template  1700 / 1700.0  (100.00%)

Waiting for changeset to be created..

CloudFormation stack changeset
---------------------------------------------------------------------------------------------------------
Operation                       LogicalResourceId                                 ResourceType            
---------------------------------------------------------------------------------------------------------
+ Add                           Events2PantherFunctionAllEventsPermission         AWS::Lambda::Permission 
+ Add                           Events2PantherFunctionAllEvents                   AWS::Events::Rule       
+ Add                           Events2PantherFunctionRole                        AWS::IAM::Role          
+ Add                           Events2PantherFunction                            AWS::Lambda::Function   
+ Add                           Events2PantherLogGroup                            AWS::Logs::LogGroup     
---------------------------------------------------------------------------------------------------------

Changeset created successfully. arn:aws:cloudformation:eu-west-3:111111111111:changeSet/samcli-deploy2222222222/b6085648-3f8c-aaaa-bbbb-yyyyyyyyyyyy


Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y

2020-01-27 18:49:40 - Waiting for stack create/update to complete

CloudFormation events from changeset
--------------------------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                      ResourceType                            LogicalResourceId                                 ResourceStatusReason       
--------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE_IN_PROGRESS                  AWS::IAM::Role                          Events2PantherFunctionRole                        -                          
CREATE_IN_PROGRESS                  AWS::Logs::LogGroup                     Events2PantherLogGroup                            -                          
CREATE_IN_PROGRESS                  AWS::IAM::Role                          Events2PantherFunctionRole                        Resource creation Initiated
CREATE_COMPLETE                     AWS::Logs::LogGroup                     Events2PantherLogGroup                            -                          
CREATE_IN_PROGRESS                  AWS::Logs::LogGroup                     Events2PantherLogGroup                            Resource creation Initiated
CREATE_COMPLETE                     AWS::IAM::Role                          Events2PantherFunctionRole                        -                          
CREATE_IN_PROGRESS                  AWS::Lambda::Function                   Events2PantherFunction                            -                          
CREATE_IN_PROGRESS                  AWS::Lambda::Function                   Events2PantherFunction                            Resource creation Initiated
CREATE_COMPLETE                     AWS::Lambda::Function                   Events2PantherFunction                            -                          
CREATE_IN_PROGRESS                  AWS::Events::Rule                       Events2PantherFunctionAllEvents                   Resource creation Initiated
CREATE_IN_PROGRESS                  AWS::Events::Rule                       Events2PantherFunctionAllEvents                   -                          
CREATE_COMPLETE                     AWS::Events::Rule                       Events2PantherFunctionAllEvents                   -                          
CREATE_IN_PROGRESS                  AWS::Lambda::Permission                 Events2PantherFunctionAllEventsPermission         Resource creation Initiated
CREATE_IN_PROGRESS                  AWS::Lambda::Permission                 Events2PantherFunctionAllEventsPermission         -                          
CREATE_COMPLETE                     AWS::Lambda::Permission                 Events2PantherFunctionAllEventsPermission         -                          
CREATE_COMPLETE                     AWS::CloudFormation::Stack              AWS-Events2Panther                                -                          
--------------------------------------------------------------------------------------------------------------------------------------------------------

Stack AWS-Events2Panther outputs:
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
OutputKey-Description                                                                                    OutputValue                                                                               
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Events2PantherFunctionIamRole - Implicit IAM Role created for the AWS Events to Panther function         arn:aws:iam::111111111111:role/AWS-Events2Panther-Events2PantherFunctionRole-XXXXXXXXXXXX
Events2PantherFunction - AWS Events to Panther Lambda Function ARN                                       arn:aws:lambda:eu-west-3:999999999999:function:AWS-Events2Panther                         
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Successfully created/updated stack - AWS-Events2Panther in eu-west-3
```

## 4. Configuring the captured events

There are two approaches to configuring which events will trigger the Lambda function.

* Setting up new triggers in the AWS Console.

* Adding new yaml config to the SAM template (`template.yaml`) that will generate the triggers for you.

Depending on your use case you may prefer either approach.

### 4.1. Generating new event triggers using SAM

In the Resources section of the SAM template (`template.yaml`), the PantherMessageProxyFunction contains a section called Events.

You will see that an event trigger has been configured (commented out) that will trigger the Lambda function when a _CloudWatchEvent_ is created that has a source value of aws.guardduty:

```yaml
    GuardDuty:
      Type: CloudWatchEvent
      Properties:
        Pattern:
          Source:
          - aws.guardduty
```

This event pattern will specify the fields to match up when filtering the CloudWatchEvents.

If the filter pattern matches that of the event json, it will trigger the function.

If you wish to capture some events, you can uncomment the following line from the start of the _lambdaHandler_ function in the `e2p/e2p.js` file:

```js
    console.log("Event Received: " + JSON.stringify(event, null, 2));
```

This will write the event json to the CloudWatch Logs log group related to the lambda function.

Some other examples of pattern filters are, any ec2 instances that are terminated:

```yaml
    EC2Events:
      Type: CloudWatchEvent
      Properties:
        Pattern:
          Source:
          - aws.ec2
          Detail:
            State:
            - terminated
```

Or if you wish to match CloudFormation lambda code deployment in eu-west-1 or eu-west-2, you could write a filter like this:

```yaml
    LambdaUpdates:
      Type: CloudWatchEvent
      Properties:
        Pattern:
          source:
          - aws-lambda
          Detail:
            AwsRegion:
            - eu-west-1
            - eu-west-2
            UserAgent:
            - cloudformation.amazonaws.com
```

AWS documentation to help you create more filters can be found here (although it's in json):

https://docs.aws.amazon.com/eventbridge/latest/userguide/filtering-examples-structure.html


### 4.2. Setting up event triggers in the AWS console

The SAM CloudFormation template includes a rule to accept all events, and send them to the lambda function.

However you can also disable that one and create your own more specific rules.

Rules can be accessed from two locations:

https://console.aws.amazon.com/cloudwatch/home

Or here:

https://console.aws.amazon.com/events/home

On either page you should click on the 'Create rule' button.

Under _Define pattern_, select _Event pattern_, then select _Pre-defined pattern by service_, select 'AWS', then select 'All Services'. This will behave in the same way as CloudTrail, by passing all AWS events to the target.

Next, under _Select targets_ ensure the target is set to 'Lambda function', and then select the function id for the one you uploaded. It sill be in the format: AWS-Events2Panther-{stack name}

Once done, you can click on the _Create_ button at the bottom of the page.

### 4.3 Advanced event filtering

If you wish to only send events to Panther for particular services, you can select 'Custom pattern', and paste in a config such as the following:

To get all events from multiple services:

```json
{
  "source": [
    "aws.apigateway",
    "aws.ec2"
  ]
}
```

To get a particular event type from a service:

```json
{
  "source": [
    "aws.ec2"
  ],
  "detail-type": [
    "EBS Snapshot Notification"
  ]
}
```

To filter for events created when a running ec2 instance has a state change to terminated:

```json
{
  "source": [ "aws.ec2" ],
  "detail-type": [ "EC2 Instance State-change Notification" ],
  "detail": {
    "state": [ "terminated" ]
  }
}
```

Filtering of events can be much more complex, here is Amazons guide:

https://docs.aws.amazon.com/eventbridge/latest/userguide/filtering-examples-structure.html

You can setup multiple filter rules, each looking for a different type of event from different services that al have the same target Lambda function.

## 5. Configuring the messages sent to panther

The messages sent to Panther are generated in the Javascript Lambda function using the information extracted from the json AWS event data.

So to edit the message generated for an event that is already handled, all you have to do is find the correct function and edit it to put the data you whish in the correct fields.

### 5.1. Currently supported event types

- [AWS API Call via CloudTrail](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/EventTypes.html#events-for-services-not-listed)
- [EC2 Instance State-change Notification](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/EventTypes.html#ec2_event_type)
- [GuardDuty Finding](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings_cloudwatch.html#guardduty_findings_cloudwatch_format)
- [Security Hub Findings](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cwe-event-formats.html)
- Config Configuration Item Change

To handle a new event type you should replicate the approach used for other events:

1. Create a new function that accepts a json object representing the event data
2. The source event may contain an array of child events, create one or more Panther message from the source data. The Panther message format can be seen below.
3. Add a new case statement into lambdaHandler function that calls your new function and puts the returned data into the _data_ variable. The data must be an array of one or more panther messages.

A Panther json message uses the following structure:

```json
"event": {
    "node": "thing being monitored",
    "tag": "A tag used for grouping",
    "summary": "A message used to describe the event",
    "severity": 1
}
```

Note: The severity is on a scale from 1-5, with 5=critical, 4=major, 3=minor, 2=warning, and 1=indeterminate

### 5.2. Testing changes locally

SAM can use a local docker image to test Lambda functions on your machine.

To run the lambda function with the test data first update the `env.json` file with your Panther API_URL and the API_TOKEN.

**Note** to create a PANTHER_API_TOKEN please consult the [Panther documentation](https://openanswers.github.io/panther-docs/panther/admin#api-keys) 

```
❯ cat env.json
{
  "Parameters": {
    "API_URL": "https://<PANTHER_NAME>.app.panther.support/api/event/create",
    "API_TOKEN": "<PANTHER_API_TOKEN>"
  }
}
```

Then invoke the lambda function with:

```console
sam build
sam local invoke Events2PantherFunction -e events/<filename>.json --env-vars env.json
```

Sample events can sometimes be found in the AWS documentation, or can be output to the console / CloudWatch Logs. The function will automatically output the event json when the processing code causes an exception, or a handler is not available for that particular type of event.

### 5.3. Checking the logs in AWS

Lambda functions produce log output that is put into a CloudWatch Log group.

Navigate to: https://console.aws.amazon.com/cloudwatch/home

Then look for the log group in the format: /aws/lambda/AWS-Events2Panther

The log group will contain multiple logs written each time the function is triggered by an event.

## 6. Uninstalling

If you wish to remove the CloudFormation stack that SAM creates you should run:

```bash
aws cloudformation delete-stack --stack-name AWS-Events2Panther --region <aws region>
```
