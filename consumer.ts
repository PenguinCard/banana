import { argv } from 'yargs';
import { Kafka } from 'kafkajs';

(async () => {
  console.info(JSON.stringify(argv));

  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['broker:9092'],
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
        const data = JSON.parse(value.toString());
        const { filePath, metaData = {} } = data;
        const { Consumer } = require(`./${filePath}`);
        await new Consumer(metaData).consume(metaData);
      }
    },
  })
})();
