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
  filePath: string;

  producer: KafkaProducer;

  constructor(
    producer: KafkaProducer,
    filePath: string,
  ) {
    this.producer = producer;
    this.filePath = filePath;
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
            filePath: this.filePath,
            metaData,
          }),
        },
      ],
    });
  }
}

class Consumer {
  async assert(assertArray: Array<[boolean, string]>) {
    const findAssertObject: [boolean, string] = assertArray.find(([isOk]) => !isOk);
    if (findAssertObject) {
      console.error(findAssertObject[1]);
    }
    return Boolean(findAssertObject);
  }

  archive() {
  }

  async push(prices: Array<Price>) {
    if (prices.length > 0) {
      console.info(`${prices.length} prices will be saved`);
      await PriceModel.insertMany(prices);
    }
  }
}

function range(start: number, end: number) {
  return end >= start ? [...Array(end).keys()].slice(start) : [];
}

async function delay(num: number) {
  await new Promise(resolve => setTimeout(resolve, num));
}

export { 
  delay,
  range,
};
