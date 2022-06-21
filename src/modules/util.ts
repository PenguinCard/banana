interface KafkaProducer {
  send: Function,
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
}

function range(start: number, end: number) {
  return end >= start ? [...Array(end + 1).keys()].slice(start) : [];
}

export {
  Producer,
  Consumer,
  range,
}
