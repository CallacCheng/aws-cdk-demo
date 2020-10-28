import * as yaml from "js-yaml";
import * as eks from "@aws-cdk/aws-eks";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as fs from "fs";

export interface EBSCSIDriverProps {
  readonly cluster: eks.Cluster;
  nodeGroup: eks.Nodegroup;
}

export class EbsCsiDriver extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: EBSCSIDriverProps) {
    super(scope, id);

    const policy = new iam.Policy(this, "ebs-csi-driver", {
      statements: json2statements()
    })

    props.nodeGroup.role.attachInlinePolicy(policy)

    function json2statements(): iam.PolicyStatement[] {
      const jsonObject = JSON.parse(fs.readFileSync("./assets/ebs-csi-driver/ebs-csi-driver.json", 'utf8'));
      return jsonObject.Statement.map((statement: any) => iam.PolicyStatement.fromJson(statement));
    }

    const ebsDeployment = yaml.safeLoadAll(fs.readFileSync("./assets/ebs-csi-driver/ebs-csi-driver.yaml").toString());

    props.cluster.addManifest("ebs-csi-driver", ...ebsDeployment);

  }

}
