import { argv } from 'yargs';
import { Kafka } from 'kafkajs';

(async () => {
  console.info(JSON.stringify(argv));

  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['broker:29092'],
  });

  const consumer = kafka.consumer({ groupId: 'crawling-group' })

  await consumer.connect()
  await consumer.subscribe({ 
    topic: 'quickstart-events', 
    fromBeginning: true 
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { value } = message;
      if (value) {
        console.info(value.toString());
        const data = JSON.parse(value.toString());
        const { filePath, metaData = {} } = data;
        const { Consumer } = require(`./src/${filePath}/index.ts`);
        await new Consumer(metaData).consume(metaData);
      }
    },
  })
})();
