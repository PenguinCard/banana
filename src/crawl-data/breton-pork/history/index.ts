import axios from 'axios';
import moment from 'moment';
import xlsx from 'xlsx';

import { Producer, Consumer, range } from "modules/util";

const requestUrl = 'https://www.marche-porc-breton.com/wp-content/themes/marcheduporcbreton/downloadCsv.php';

class BretonProducer extends Producer {
  async produce() {
    await this.push({});
  }
}

class BretonConsumer extends Consumer{
  async consume() {
    const entries = [];
    const date = moment();
    const date2 = date.format('YYYY-MM-DD');
    const date1 = '1997-01-01';
    let response: any;
    try {
      const { data } = await axios.get(`${requestUrl}?date1=${date1}&date2=${date2}`, { 
        responseType: 'arraybuffer'
      });
      response = Buffer.from(data, 'base64');
    } catch (e) {
      console.error(`${requestUrl}?date1=${date1}&date2=${date2}`, e);
    }

    const workbook = xlsx.read(response);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    await this.assert([
      [sheet.A1.v === 'Date', `date row: 'Date' -> ${sheet.A1.v}`],
      [sheet.C1.v === 'Base56', `priceAvg row name: 'Base56' -> '${sheet.C1.v}'`],
    ]);

    const sheetRange = sheet['!ref'];
    const [, EndPoint = '2'] = sheetRange.split(':');
    const endRowNum = Number(EndPoint.replace(/\D/g, ''));
   
    const product = 'Pork';
    const grade = '56% TMP';
    const region = 'Brittany';
    const unit = '1 kg';

    for (const idx of range(2, endRowNum)) { 
      const rawDate = sheet[`A${idx}`].w.trim();
      const priceAvg = sheet[`C${idx}`].w?.trim()?.replaceAll(',', '.') || 0; 
      const date = moment(rawDate, 'M/D/YY').format('YYYY-MM-DD');

      if (!sheet[`C${idx}`].w) {
        console.error('no price', date, sheet[`C${idx}`].w, sheet[`C${idx}`]);
      }

      const entry = {
        date,
        grade,
        product,
        priceAvg,
        region,
        unit,
        country: 'FR',
        currency: 'EUR',
        type: 'w'
      }
      entries.push(entry);
    }
    await this.push(entries);
  }
}

 export {
  BretonProducer as Producer,
  BretonConsumer as Consumer,
}
