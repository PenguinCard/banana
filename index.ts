import { argv } from 'yargs';
import { Kafka } from 'kafkajs';

(async () => {
  console.info(JSON.stringify(argv));

  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['127.0.0.1:9092'],
  });

  const consumer = kafka.consumer({ groupId: 'crawling-group' })

  await consumer.connect()
  await consumer.subscribe({ topic: 'crawling-events', fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      })
    },
  })
})();
