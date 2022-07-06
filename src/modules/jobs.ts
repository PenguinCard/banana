import moment from 'moment';
import PriceModel from 'models/Price';

interface KafkaProducer {
  send: Function,
}

export interface Price {
  country: string,
  currency: string,
  date: string,
  grade?: string | null,
  priceAvg?: string | number | null,
  priceMax?: string | number | null,
  priceMin?: string | number | null,
  product: string,
  region?: string,
  unit: string,
  type: string,
}

class Producer {
  static browserOption: boolean = false;

  metaDate: string;

  filePath: string;

  producer: KafkaProducer;

  constructor(
    producer: KafkaProducer,
    filePath: string,
    metaDate: string = moment().subtract(1, 'days').format('YYYY-MM-DD'),
  ) {
    this.producer = producer;
    this.filePath = filePath;
    this.metaDate = metaDate;
  }

  async assert(assertArray: Array<[boolean, string]>) {
    const findAssertObject: [boolean, string] = assertArray.find(([isOk]) => !isOk);
    if (findAssertObject) {
      console.error(findAssertObject[1]);
    }
    return Boolean(findAssertObject);
  }

  async push(metaData: object) {
    await this.producer.send({
      topic: 'quickstart-events',
      messages: [
        {
          partition: 0,
          value: JSON.stringify({
            metaData,
            filePath: this.filePath,
            metaDate: this.metaDate
          }),
        },
      ],
    });
  }
}

class Consumer {
  static pathName: string = '';

  static browserOption: boolean = false;

  metaDate: string;

  constructor(metaDate: string) {
    this.metaDate = metaDate
  }

  async assert(assertArray: Array<[boolean, string]>) {
    const findAssertObject: [boolean, string] = assertArray.find(([isOk]) => !isOk);
    if (findAssertObject) {
      console.error(findAssertObject[1]);
    }
    return Boolean(findAssertObject);
  }

  async archive(_doc: string | Buffer, seq:number = 1, date: string = '', ext: string = 'html', version: number = 1) {
    const today = moment().format('YYYY-MM-DD');
    const path = `archive/crawl-data/${Consumer.pathName}/v${version}/${date ? `${date}/` : ''}${today}/s${seq}.${ext}`;
    console.info(`archive path : ${path}`); 
  }

  async push(prices: Array<Price>) {
    if (prices.length > 0) {
      console.info(`${prices.length} prices will be saved`);
      await PriceModel.insertMany(prices);
    }
  }
}

export {
  Producer,
  Consumer,
}
