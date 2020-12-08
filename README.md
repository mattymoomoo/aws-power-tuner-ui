# AWS Lambda Power Tuner UI

![GitHub license](https://img.shields.io/github/license/mattymoomoo/aws-power-tuner-ui)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/mattymoomoo/aws-power-tuner-ui/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/mattymoomoo/aws-power-tuner-ui.svg)](https://github.com/mattymoomoo/aws-power-tuner-ui/issues)
[![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

AWS Lambda Power Tuner UI is a deployable **easy to use website** built on a layered technology stack allowing you to optimize your Lambda functions for cost and/or performance in a data-driven way.

By using a *user interface* instead of worrying about IAM users, CLI commands, Amazon API Gateway etc, developers can run Lambda power tuning much easier and more consistently in a matter of seconds.

Read about how this project started on [medium](https://medium.com/@matthewdorrian/save-money-and-improve-performance-with-the-lambda-power-tuner-ui-bad594176008)

![Website](imgs/website.png?raw=true)

Once deployed into your AWS account, developers need to know only the ARN of the lambda and tweak the various settings to their own liking and simply click Start power tuner.

The foundation uses [Alex Casalboni's Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning) state machine powered by AWS Step Functions.

This solution abstracts away the implementation of the tuner through the simplicity of AWS CDK and lowers the barrier of entry to this essential activity

## How do you deploy and run the website in your AWS account?

You can deploy the solution to your AWS account using the following easy steps:

#### Git clone and install node modules

Clone down the repo and install the modules in both folders
```bash
git clone https://github.com/mattymoomoo/aws-power-tuner-ui.git

cd aws-power-tuner-ui/website
npm install

cd ../cdk
npm install
```

#### Deploy tuning infrastructure

Run the following command in the **cdk** directory to deploy the infrastructure:

```bash
npm run deploy-infra
```

_Note: This will create a folder called **website-output** which is required for the website infrastructure and deploy the tuning infrastructure._

Once the infrastructure is deployed, the Amazon API Gateway endpoint will be made available as a CDK stack output:

```bash
Outputs:

NAME = https://UNIQUE_ID.execute-api.REGION.amazonaws.com/development
```

Copy this value and update the _apiGatewayBaseUrl_ prod (without ending slash) environment variable within the **website/src/environments/environment.prod.ts** file. This will tell the angular app where to execute the power tuner:

```bash
export const environment = {
  apiGatewayBaseUrl: 'https://UNIQUE_ID.execute-api.REGION.amazonaws.com/development',
  production: true,
};

```

Once the endpoint is updated in the prod environment file, build the website to create the static files to be used for deployment:

_Note: Make sure to run the below command in the `website/` directory_

```bash
npm run build
```
#### Deploy the website infrastructure

Once the website is built, run the following command in the **cdk** directory to deploy the website infrastructure:

If you have never deployed a CDK app to your AWS account, you need to first deploy static assets:
```bash
# Replace ACCOUNT_ID with your account ID, REGION with the region you're working in
npm run cdk bootstrap aws://ACCOUNT_ID/REGION
```

If you don't run this, the deploy-website operation below will report the error

_PowerTunerWebsiteStack failed: Error: This stack uses assets, so the toolkit stack must be deployed to the environment_

```bash
npm run deploy-website
```

And **that is it** ... you will now have a deployed website which the url will be visible in the stack output which can communicate with the deployed infrastructure.

Once deployed into your AWS account, developers need to know only the ARN of the lambda and tweak the various settings to their own liking and simply click Start power tuner:

![Website](imgs/website.png?raw=true)

The tuner will generate a visualisation of average cost and speed for each power configuration using [Matteo's tool](https://github.com/matteo-ronchetti/aws-lambda-power-tuning-ui) and shows the recommended memory based on the selected strategy including average cost & duration.

![Visualisation](imgs/visual.png?raw=true)

#### Extra: Do you need an example Lambda function to run?

An example Hello Lambda function has been included for you to test out the tuner to verify all the parts are connected and working as expected.

To deploy the Lambda function, simple run inside the **cdk** directory:

```bash
npm run deploy-lambda
```

You can now grab the ARN of the deployed Lambda function and run the tuner.

## What does the deployed architecture look like?

The architecture is as follows:

- Angular 9 website fronted via Amazon CloudFront & Amazon S3
- Amazon API Gateway using direct integrations to AWS Step functions
- Alex Casalboni's Power Tuning State Machine

![Architecture](imgs/infrastructure.png?raw=true)


## Contribution

Feature requests and pull requests are more than welcome!
