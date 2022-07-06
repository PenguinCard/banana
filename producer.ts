import * as yargs from 'yargs';
import { Kafka } from 'kafkajs';

(async () => {
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['broker:29092'],
  });

  const producer = kafka.producer();
  await producer.connect();

  const argv = await yargs.argv;
  console.log(argv);
  const [filePath = ''] = argv._;

  if (filePath) {
    const { Producer } = require(`./src/${filePath}/index.ts`);
  
    if (argv.date) {
      await new Producer(
        producer,
        filePath,
        argv.date,
      ).produce();
    } else if (argv.range) {
    } else {
      await new Producer(
        producer,
        filePath,
      ).produce();
    }
  }

  await producer.disconnect();
})();
