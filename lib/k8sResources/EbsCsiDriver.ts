import * as yaml from "js-yaml";
import * as eks from "@aws-cdk/aws-eks";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as fs from "fs";

export interface EBSCSIDriverProps {
  readonly cluster: eks.Cluster;
}

export class EbsCsiDriver extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: EBSCSIDriverProps) {
    super(scope, id);

    const ebsNamespace = "kube-system";
    const ebsServiceAccount = props.cluster.addServiceAccount("ebs-csi-driver", {
      name: "ebs-csi-driver",
      namespace: ebsNamespace,
    });

    const policyJson = fs.readFileSync("./assets/ebs-csi-driver/ebs-csi-driver.json").toString();

    ((JSON.parse(policyJson))["Statement"] as []).forEach((statement, idx, array) => {
      ebsServiceAccount.addToPolicy(iam.PolicyStatement.fromJson(statement));
    });

    props.cluster.awsAuth.addRoleMapping

    const ebsDeployment = yaml.safeLoadAll(fs.readFileSync("./assets/ebs-csi-driver/ebs-csi-driver.yaml").toString());

    props.cluster.addManifest("ebs-csi-driver", ...ebsDeployment);

  }

}
