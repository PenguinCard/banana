import cheerio from 'cheerio';
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
  constructor(metaDate: string) {
    super(metaDate);
    Consumer.pathName = 'eislem';
  }
  
  async consume() {
    const entries = [];
    const { metaDate } = this;
    const htmlDate = moment(metaDate).format('DD.MM.YYYY');
    const xlsxDate = moment(metaDate).format('YYYY-MM-DD');
    let response: any;

    try {
      response = await request(`https://eislem.izmir.bel.tr/tr/BalikHalFiyatlari?date2=${htmlDate}`);
      const $ = cheerio.load(response);
      const isDisabled = $('#DosyaExcel').hasClass('disabled');
       
      if (isDisabled) {
        throw new Error('ExcelFile does not exist')
      }

      response = await request({
        url: `https://eislem.izmir.bel.tr/tr/BalikHalFiyatlari/ExceleAktar/${xlsxDate}`,
        type: 'buffer',
      })
    } catch (e) {
      console.error(e);
      return;
    }

    await this.archive(response);

    const workbook = xlsx.read(response);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetRange = sheet['!ref'];
    
    const isUIchanged = await this.assert([
      [Boolean(sheetRange), 'No range in excel'],
      [sheet.A1.w === 'Tip', `'TİP' -> '${sheet.A1.w}'`],
      [sheet.B1.w === 'Adi', `'Adi' -> '${sheet.B1.w}'`],
      [sheet.C1.w === 'Birimi', `'Birimi' -> '${sheet.C1.w}'`],
      [sheet.D1.w === 'EnAz', `'EnAz' -> '${sheet.D1.w}'`],
      [sheet.E1.w === 'EnCok', `'EnCok' -> '${sheet.E1.w}'`],
      [sheet.F1.w === 'Ortalama', `'Ortalama' -> '${sheet.F1.w}'`],
    ])

    if (isUIchanged) {
      console.error('UI is changed')
      return;
    }

    const endRowNum = Number(sheetRange.split(':')[1]?.replace(/\D/g, ''));
    for (const i of range(2, endRowNum + 1)) {
      const product = sheet[`A${i}`].w.trim();
      const variety = sheet[`B${i}`].w.trim();
      const unit = sheet[`C${i}`].w.trim();
      const priceMin = sheet[`D${i}`].w.trim().replace(',', '.');
      const priceMax = sheet[`E${i}`].w.trim().replace(',', '.');
      const priceAvg = sheet[`F${i}`].w.trim().replace(',', '.');

      const entry = {
        priceAvg,
        priceMax,
        priceMin,
        product,
        variety,
        unit,
        country: 'TR',
        currency: 'TRY',
        date: metaDate,
        region: 'Izmir',
        type: 'w',
      }

      entries.push(entry);
    }
    await this.push(entries);
  }
}

export {
  EislemProducer as Producer,
  EislemConsumer as Consumer,
}
