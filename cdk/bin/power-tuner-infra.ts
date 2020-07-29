#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PowerTunerInfraStack } from '../lib/power-tuner-stack';
import { PowerTunerWebsiteStack } from '../lib/website-stack';
import { PowerTunerAPIGatewayStack } from '../lib/api-gateway-stack';

const app = new cdk.App();
const powerTunerInfraStack = new PowerTunerInfraStack(app, 'PowerTunerInfraStack');
const powerTunerWebsiteStack = new PowerTunerWebsiteStack(app, 'PowerTunerWebsiteStack');
const powerTunerAPIGatewayStack = new PowerTunerAPIGatewayStack(app, 'PowerTunerAPIGatewayStack');
powerTunerInfraStack.addDependency(powerTunerAPIGatewayStack);
