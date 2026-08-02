import {Stack} from "aws-cdk-lib";
import {PowerTunerLambdaStack} from '../lib/lambda-stack';
import '@aws-cdk/assert/jest';

test('should create the sample lambda function with correct handler', () => {
  const stack = new Stack();
  const lambdaStack = new PowerTunerLambdaStack(stack, 'lambdaStack');
  expect(lambdaStack).toHaveResourceLike('AWS::Lambda::Function', {
    Handler: 'hello.handler',
    Runtime: 'nodejs12.x'
  });
});