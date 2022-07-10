import * as yargs from 'yargs';
import moment from 'moment';
import { Kafka } from 'kafkajs';

import { delay } from 'modules/util';

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
      const [startRawDate, endRawDate] = String(argv.range).split('~');
      if (startRawDate && endRawDate) {
        try {
          let metaDate = moment(startRawDate);
          const endDate = moment(endRawDate);
          while (metaDate < endDate) {
            const currentDate = metaDate.format('YYYY-MM-DD');
            console.info(`date ${currentDate}`);
            await new Producer(
              producer,
              filePath,
              currentDate,
            ).produce();
            await delay(500);
            metaDate.add(1, 'days');
          }
        } catch (e) {
        }
      }
    } else {
      await new Producer(
        producer,
        filePath,
      ).produce();
    }
  }

  await producer.disconnect();
})();
