import * as yaml from "js-yaml";
import * as eks from "@aws-cdk/aws-eks";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

export interface MetricsServerProps {
  readonly cluster: eks.Cluster;
}

export class MetricsServer extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: MetricsServerProps) {
    super(scope, id);

    const msDeployment = yaml.safeLoadAll(fs.readFileSync("./assets/metrics-server/components.yaml").toString());
    props.cluster.addManifest("metrics-server", ...msDeployment);

  }

}
