import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

import { ALBIngressController } from './k8sResources/ALBIngressController';
import { EbsCsiDriver } from './k8sResources/EbsCsiDriver';

export class AwsEksStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const clusterAdmin = new iam.Role(this, "AdminRole", {
      assumedBy: new iam.AccountRootPrincipal()
    })

    // define the vpc
    const vpc = new ec2.Vpc(this, "quarkus-demo-vpc", {
      maxAzs: 2
    });

    const cluster = new eks.Cluster(this, 'cluster', {
      version: eks.KubernetesVersion.V1_17,
      clusterName: "MyEKSCluster",
      mastersRole: clusterAdmin,
      defaultCapacity: 0,
      vpc,
    })

    const frist = cluster.addNodegroupCapacity("frist", {
      instanceType: new ec2.InstanceType('m5.large'),
      desiredSize: 1,
      diskSize: 100,
      minSize: 1,
      remoteAccess: {
        sshKeyName: "cq",
      },
      nodegroupName: "app1",
      labels: {
        app: 'deploy'  
      }
    })

    // add jenkins mapping
    const jenkins =  iam.User.fromUserName(this, "jenkins", "jenkins")

    cluster.awsAuth.addUserMapping(jenkins , {
      groups: ['system:masters'] 
    })

    // add ALB ingress controller
    const albIngressController = new ALBIngressController(this, "ALB-ingress-controller", {
      cluster: cluster,
      vpcId: vpc.vpcId,
      region: this.region,
      version: "1.1.8"
    });

    albIngressController.node.addDependency(cluster);

    // add EBS CSI driver
    new EbsCsiDriver(this, 'ebs-csi-driver', {cluster});

  }

}
