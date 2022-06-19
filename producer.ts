import * as yargs from 'yargs';
import { Kafka } from 'kafkajs';

(async () => { 
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['broker:9092'],
  });

  const producer = kafka.producer();
  await producer.connect();

  const argv = await yargs.argv;
  const [ filePath = '' ] = argv._;

  if (filePath) {
    const { Producer } = require(`./${filePath}.ts`);
    await new Producer(producer, filePath).produce();
  }

  await producer.disconnect()
})();
