import 'source-map-support/register';
import {App} from "aws-cdk-lib";
import {PowerTunerWebsiteStack} from '../lib/website-stack';
import {PowerTunerStack} from '../lib/power-tuner-stack';
import {PowerTunerLambdaStack} from '../lib/lambda-stack';

const app = new App();
const powerTunerInfraStack = new PowerTunerStack(app, 'PowerTunerInfraStack');
const powerTunerWebsiteStack = new PowerTunerWebsiteStack(app, 'PowerTunerWebsiteStack');
// Test lambda for tuning
const powerTunerLambdaStack = new PowerTunerLambdaStack(app, 'PowerTunerLambdaStack');
