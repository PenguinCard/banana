import moment from 'moment';
import xlsx from 'xlsx';

import request from 'modules/request';
import { range } from 'modules/util';
import { Producer, Consumer } from 'modules/jobs';

class EislemProducer extends Producer {
  async produce() {
    await this.push({});
  }
}

class EislemConsumer extends Consumer {
  constructor() {
    super();
    Consumer.pathName = 'eislem';
  }
  
  async consume() {
    let response: any;
    try {
      response = await request({
        url: 'https://eislem.izmir.bel.tr/tr/BalikHalFiyatlari/',
        type: 'buffer',
      })
    } catch (e) {
      console.error(e);
    }

    await this.archive(response);

    const workbook = xlsx.read(response);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    console.log(JSON.stringify(sheet));
  }
}

export {
  EislemProducer as Producer,
  EislemConsumer as Consumer,
}
