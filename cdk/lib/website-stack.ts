import * as cdk from '@aws-cdk/core';
import { SPADeploy } from 'cdk-spa-deploy';

export class PowerTunerWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new SPADeploy(<any>this, 'websiteDeploy', { encryptBucket: true })
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: 'website-output'
      });
  }
}
