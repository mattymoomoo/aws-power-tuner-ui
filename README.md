# AWS Lambda Power Tuner UI

[![GitHub license](https://img.shields.io/github/license/mattymoomoo/aws-power-tuner-ui.svg)](https://github.com/mattymoomoo/aws-power-tuner-ui/blob/master/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/mattymoomoo/aws-power-tuner-ui/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/mattymoomoo/aws-power-tuner-ui.svg)](https://github.com/mattymoomoo/aws-power-tuner-ui/issues)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

AWS Lambda Power Tuner UI is a layered technology stack allowing you to optimize your Lambda functions for cost and/or performance in a data-driven way using an easy to use user interface instead of worrying about IAM users, CLI commands, Amazon API Gateway etc.

The foundation uses [Alex Casalboni's Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning) state machine powered by AWS Step Functions.

This solution abstracts away the implementation of the tuner through the simplicity of AWS CDK and lowers the barrier of entry to this essential activity

## How do you deploy this in your account?

You can deploy the solution to your AWS account using the following easy steps:

- Clone down the repo and install the modules in both folders
```bash
git clone https://github.com/mattymoomoo/aws-power-tuner-ui.git

cd aws-power-tuner-ui/website
npm install

cd ../cdk
npm install
```

## What does the architecture look like?

The architecture is as follows:

- Angular 9 website fronted via Amazon CloudFront & Amazon S3
- Amazon API Gateway using direct integrations to AWS Step functions
- Alex Casalboni's Power Tuning State Machine

![Architecture](imgs/infrastructure.png?raw=true)
