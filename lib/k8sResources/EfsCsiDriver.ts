import * as yaml from "js-yaml";
import * as eks from "@aws-cdk/aws-eks";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

export interface EFSCSIDriverProps {
  readonly cluster: eks.Cluster;
  readonly fileSystemId: string;
  readonly namespace?: string,
}

export class EfsCsiDriver extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: EFSCSIDriverProps) {
    super(scope, id);
    const efsDeployment = yaml.safeLoadAll(fs.readFileSync('./assets/efs-csi-driver/node.yaml').toString());
    const efsCsi = props.cluster.addManifest('efs-csi', efsDeployment);
    const efsClass = 'efs-sc';
    const efsSC = props.cluster.addManifest('efs-storageclass',
      {
        kind: 'StorageClass',
        apiVersion: 'storage.k8s.io/v1',
        metadata: {
          name: efsClass,
        },
        provisioner: 'efs.csi.aws.com'
      });
    const efsPV = props.cluster.addManifest('efs-pv', {
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      metadata: {
        name: 'efs-pv',
      },
      spec: {
        capacity: {
          storage: '1000Gi'
        },
        volumeMode: 'Filesystem',
        accessModes: [
          'ReadWriteMany'
        ],
        persistentVolumeReclaimPolicy: 'Retain',
        storageClassName: efsClass,
        csi: {
          driver: 'efs.csi.aws.com',
          volumeHandle: props.fileSystemId,
        }
      }
    });

    const efsPVC = props.cluster.addManifest('efs-pvc', {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        name: 'efs-storage-claim',
        namspace: props.namespace ?? 'default',
      },
      spec: {
        accessModes: [
          'ReadWriteMany'
        ],
        storageClassName: efsClass,
        resources: {
          requests: {
            storage: '5Gi',
          }
        }
      }
    });
    efsSC.node.addDependency(efsCsi);
    efsPV.node.addDependency(efsSC);
    efsPVC.node.addDependency(efsPV);

  }

}
