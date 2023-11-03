import {Construct} from 'Constructs';
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";

export class PowerTunerLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new Function(this, 'HelloHandler', {
      runtime: Runtime.NODEJS_18_X,    // execution environment
      code: Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });

    new CfnOutput(this, 'LambdaArn', {
      value: hello.functionArn,
      description: 'Sample Hello Lambda Arn'
    });
  }
}
