import {Stack} from "aws-cdk-lib";
import '@aws-cdk/assert/jest';
import {PowerTunerStack} from '../lib/power-tuner-stack';

test('should create the an API Gateway with associated properties', () => {
  const stack = new Stack();
  const infraStack = new PowerTunerStack(stack, 'infraStack');
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::RestApi', {
    Name: 'power-tuner-gateway',
    EndpointConfiguration: {
      Types: ['REGIONAL']
    }
  });
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::Deployment', {});
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::Stage', {
    StageName: 'development'
  });
});

test('should create the start power tuner resource with direct start execution state machine integration', () => {
  const stack = new Stack();
  const infraStack = new PowerTunerStack(stack, 'infraStack');
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::Resource', {
    PathPart: 'power-tuner'
  });
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::Method', {
    HttpMethod: 'POST',
    OperationName: 'StartTuner',
    Integration: {
      IntegrationHttpMethod: 'POST',
      Type: 'AWS',
      Uri: {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              'Ref': 'AWS::Partition'
            },
            ':apigateway:',
            {
              'Ref': 'AWS::Region'
            },
            ':states:action/StartExecution'
          ]
        ]
      },
    }
  });
});

test('should create the describe power tuner resource with direct describe execution state machine integration', () => {
  const stack = new Stack();
  const infraStack = new PowerTunerStack(stack, 'infraStack');
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::Resource', {
    PathPart: 'result'
  });
  expect(infraStack).toHaveResourceLike('AWS::ApiGateway::Method', {
    HttpMethod: 'POST',
    OperationName: 'DescribeTunerResult',
    Integration: {
      IntegrationHttpMethod: 'POST',
      Type: 'AWS',
      Uri: {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              'Ref': 'AWS::Partition'
            },
            ':apigateway:',
            {
              'Ref': 'AWS::Region'
            },
            ':states:action/DescribeExecution'
          ]
        ]
      },
    },
  });
});

test('should deploy the serverless application for the aws-lambda-power-tuning', () => {
  const stack = new Stack();
  const infraStack = new PowerTunerStack(stack, 'infraStack');
  expect(infraStack).toHaveResourceLike('AWS::Serverless::Application', {
    Location: {
      ApplicationId: 'arn:aws:serverlessrepo:us-east-1:451282441545:applications/aws-lambda-power-tuning'
    }
  });
});
