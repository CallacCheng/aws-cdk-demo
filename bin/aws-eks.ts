#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsEksStack } from '../lib/aws-eks-stack';

const app = new cdk.App();
const env = {
    account: "xxxxxxxxx",
    region: 'us-east-1'
  };
new AwsEksStack(app, 'AwsEksStack', {env});
