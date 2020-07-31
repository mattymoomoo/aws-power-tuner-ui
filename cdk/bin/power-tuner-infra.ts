#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PowerTunerWebsiteStack } from '../lib/website-stack';
import { PowerTunerStack } from '../lib/power-tuner-stack';
import { PowerTunerLambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();
const powerTunerInfraStack = new PowerTunerStack(app, 'PowerTunerInfraStack');
const powerTunerWebsiteStack = new PowerTunerWebsiteStack(app, 'PowerTunerWebsiteStack');
// Test lambda for tuning
const powerTunerLambdaStack = new PowerTunerLambdaStack(app, 'PowerTunerLambdaStack');
