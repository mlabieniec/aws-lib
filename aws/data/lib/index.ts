import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import { Construct } from 'constructs';

export interface DataProps {
  // Define construct properties here
}

export class Data extends Construct {

  dbUser:dynamodb.Table;
  dbData:dynamodb.Table;
  stream: kinesis.Stream;

  constructor(scope: Construct, id: string, props: DataProps = {}) {
    super(scope, id);

    this.stream = new kinesis.Stream(this, 'appDbStream');
  
    this.dbUser = new dynamodb.Table(this, 'appUsers', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.dbData = new dynamodb.Table(this, 'appData', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      kinesisStream:this.stream
    });
  }
}
