import { Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { PowerTunerWebsiteStack } from '../lib/website-stack';

test('should create the static file s3 bucket', () => {
  const stack = new Stack();
  const lambdaStack = new PowerTunerWebsiteStack(stack, 'websiteStack');
  expect(lambdaStack).toHaveResourceLike('AWS::S3::Bucket', {
    WebsiteConfiguration: {
      IndexDocument: 'index.html',
    }
  });
});

test('should create the CloudFront distribution', () => {
  const stack = new Stack();
  const websiteStack = new PowerTunerWebsiteStack(stack, 'websiteStack');
  expect(websiteStack).toHaveResourceLike('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      DefaultRootObject: 'index.html',
      DefaultCacheBehavior: {
        ViewerProtocolPolicy: 'redirect-to-https'
      }
    }
  });
});