import PriceModel from 'models/Price';

interface KafkaProducer {
  send: Function,
}

interface Price {
  country: string,
  currency: string,
  date: string,
  grade: string,
  priceAvg?: string | null,
  priceMax?: string | null,
  priceMin?: string | null,
  product: string,
  region: string,
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

  async assert(assertArray: Array<[condition: boolean, msg: string]>) {
    const findAssertObject: [condition: boolean, msg: string] = assertArray.find(assertObject => !assertObject[0]);
    if (findAssertObject) {
      console.error(findAssertObject[1]);
    }
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
    })
  } 
}

class Consumer {
  async assert(assertArray: Array<[condition: boolean, msg: string]>) {
    const assertObject = assertArray.find(assertObject => !assertObject[0]);
    if (assertObject) {
      console.error(assertObject[1]);
    }
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

export {
  Producer,
  Consumer,
  range,
};
