import {Construct} from 'Constructs';
import {Stack, StackProps} from "aws-cdk-lib";
import {SPADeploy} from 'cdk-spa-deploy';

export class PowerTunerWebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new SPADeploy(<any>this, 'websiteDeploy', { encryptBucket: true })
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: 'website-output'
      });
  }
}
