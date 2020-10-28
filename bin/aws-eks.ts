#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsEksStack } from '../lib/aws-eks-stack';

const app = new cdk.App();
const env = {
  region: process.env.CDK_DEFAULT_REGION,
account: process.env.CDK_DEFAULT_ACCOUNT,
};
new AwsEksStack(app, 'AwsEksStack', {env});
