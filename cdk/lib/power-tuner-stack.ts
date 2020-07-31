import * as cdk from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');
import {
  RestApi, AwsIntegration, RestApiProps,
  EndpointType, PassthroughBehavior
} from '@aws-cdk/aws-apigateway';
import { LambdaPowerTuner } from 'cdk-lambda-powertuner';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';

export class PowerTunerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let iamRole = this.setupLambdaRole(this);

    // update to lock down CORS to a specific origin
    const corsOrigin = '*';
    let gatewayProps = this.defaultProperties('power-tuner-gateway', corsOrigin);
    let apiGateway = new RestApi(this, `powerTunerRestApi`, gatewayProps.restApiProps);

    let powerRoute = apiGateway.root.addResource('power-tuner');

    // Create power tuner step function
    const tuner = new LambdaPowerTuner(this, `powerTuner`, {
      lambdaResource: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:*`
    });

    const stateMachine = tuner.stateMachine as StateMachine;
    const powerTunerStepFunctionArn = stateMachine.stateMachineArn;
    const powerTunerStepFunctionExecutionArn = `arn:aws:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:execution:${stateMachine.stateMachineName}`;
    const tunerRequestTemplate = JSON.stringify({
      input: "$util.escapeJavaScript($input.json('$'))",
      stateMachineArn: powerTunerStepFunctionArn
    });

    const tunerResponseTemplate = JSON.stringify({
      executionToken: "$util.parseJson($input.json('$.executionArn')).split(':')[7]"
    });

    const getTunerResultRequestTemplate = JSON.stringify({
      executionArn: `${powerTunerStepFunctionExecutionArn}:$util.parseJson($input.json('$.executionToken'))`
    });

    const getTunerResultResponseTemplate = JSON.stringify({
      status: "$util.parseJson($input.json('$.status'))",
      output: "$util.escapeJavaScript($util.parseJson($input.json('$.output')))"
    });

    const integrationResponseParameters = {
      "method.response.header.Vary": "'Origin'",
      "method.response.header.Access-Control-Allow-Origin": `'${corsOrigin}'`,
      "method.response.header.Access-Control-Allow-Methods": "'POST'",
    };

    const methodResponseParameters = {
      "method.response.header.Vary": true,
      "method.response.header.Access-Control-Allow-Origin": true,
      "method.response.header.Access-Control-Allow-Methods": true,
    };

    powerRoute.addMethod('POST', new AwsIntegration({
      service: 'states',
      action: 'StartExecution',
      options: {
        passthroughBehavior: PassthroughBehavior.NEVER,
        credentialsRole: iamRole as any,
        requestTemplates: {
          'application/json': tunerRequestTemplate
        },
        integrationResponses: [
          {
            selectionPattern: '',
            statusCode: '200',
            responseParameters: integrationResponseParameters,
            responseTemplates: {
              'application/json': tunerResponseTemplate
            }
          }
        ]
      }
    }), {
      operationName: 'StartTuner',
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: methodResponseParameters
        }
      ]
    });

    let powerResultRoute = powerRoute.addResource('result');
    powerResultRoute.addMethod('POST', new AwsIntegration({
      service: 'states',
      action: 'DescribeExecution',
      options: {
        passthroughBehavior: PassthroughBehavior.NEVER,
        credentialsRole: iamRole as any,
        requestTemplates: {
          'application/json': getTunerResultRequestTemplate
        },
        integrationResponses: [
          {
            selectionPattern: '',
            statusCode: '200',
            responseParameters: integrationResponseParameters,
            responseTemplates: {
              'application/json': getTunerResultResponseTemplate
            }
          }
        ]
      }
    }), {
      operationName: 'DescribeTunerResult',
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: methodResponseParameters
        }
      ]
    });
  }

  defaultProperties(apiGatewayName: string, cors = '*', env = 'development') {
    const theRestApiProps: RestApiProps = {
      restApiName: apiGatewayName,
      cloudWatchRole: false,
      defaultCorsPreflightOptions: {
        allowOrigins: [cors],
        allowHeaders: ['x-requested-with', 'authorization', 'content-type', 'pragma', 'cache-control', 'expires']
      },
      deployOptions: {
        stageName: env,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 50
      },
      endpointTypes: [
        EndpointType.REGIONAL
      ]
    };
    let defaultProps = {
      restApiProps: theRestApiProps
    };
    return defaultProps;
  }

  setupLambdaRole(scope: any): iam.Role {
    let iamRole = new iam.Role(scope, 'DefaultLambdaHanderRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    iamRole.assumeRolePolicy?.addStatements(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.ServicePrincipal('apigateway.amazonaws.com')
      ],
      actions: [
        'sts:AssumeRole'
      ]
    }));

    iamRole.addToPolicy(new iam.PolicyStatement(
      {
        effect: iam.Effect.ALLOW,
        actions: [
          'states:StartExecution'
        ],
        resources: [
          `arn:aws:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stateMachine:*`
        ]
      }));
    iamRole.addToPolicy(new iam.PolicyStatement(
      {
        effect: iam.Effect.ALLOW,
        actions: [
          'states:DescribeExecution',
        ],
        resources: [
          `arn:aws:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:execution:*`
        ]
      }));

    return iamRole;
  }
}
