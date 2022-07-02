import moment from 'moment';
import xlsx from 'xlsx';

import request from 'modules/request';
import { range } from 'modules/util';
import { Producer, Consumer } from 'modules/jobs';

const requestUrl = 'https://www.marche-porc-breton.com/wp-content/themes/marcheduporcbreton/downloadCsv.php';

class BretonProducer extends Producer {
  async produce() {
    await this.push({});
  }
}

class BretonConsumer extends Consumer {
  async consume() {
    const entries = [];
    const today = moment();
    const date2 = today.format('YYYY-MM-DD');
    const date1 = '1997-01-01';
    let response: any;
    try {
      response = await request({
        method: 'GET',
        url: `${requestUrl}?date1=${date1}&date2=${date2}`,
        type: 'buffer',
      });
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
    if (!sheetRange) {
      console.error('no range in csv');
      return;
    }
    const endRowNum = Number(sheetRange.split(':')[1].replace(/\D/g, ''));

    const product = 'Pork';
    const grade = '56% TMP';
    const region = 'Brittany';
    const unit = '1 kg';

    for (const idx of range(2, endRowNum + 1)) {
      const rawDate = sheet[`A${idx}`].w.trim();
      const priceAvg = sheet[`C${idx}`].w?.trim().replaceAll(',', '.') || 0;
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
        type: 'w',
      };
      entries.push(entry);
    }
    await this.push(entries);
  }
}

export {
  BretonProducer as Producer,
  BretonConsumer as Consumer,
};
