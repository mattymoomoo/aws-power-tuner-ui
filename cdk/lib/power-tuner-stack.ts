import * as cdk from '@aws-cdk/core';
import { LambdaPowerTuner } from 'cdk-lambda-powertuner';

export class PowerTunerInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create power tuner step function
    new LambdaPowerTuner(this, `powerTuner`, {
      lambdaResource: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:*`
    });
  }
}
