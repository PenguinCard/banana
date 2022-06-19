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

export {
  Producer,
}
