import { Producer } from "../modules/util";

const requestUrl = 'https://www.oae.go.th/view/1/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%81%E0%B8%A9%E0%B8%95%E0%B8%A3/TH-TH'
class testProducer extends Producer {
  async produce() {
    for(let i = 0; i <= 4; i+=1) {
      await this.push({ number: i });
    }
  }
}

class testConsumer {
  async consume(metaData: object) {
    console.log(JSON.stringify(metaData));
  }
}

export {
  testProducer as Producer,
  testConsumer as Consumer,
}
