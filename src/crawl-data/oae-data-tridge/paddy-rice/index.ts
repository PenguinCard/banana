import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

import { Price } from 'modules/util';
import { Producer, Consumer } from 'modules/jobs';

const requestUrl = 'http://www.oae.go.th/view/1/ราคาสินค้าเกษตร/TH-TH';
const THAI_SOLAR_CALENDER = 543;

class OaeProducer extends Producer {
  async produce() {
    let response: any;
    try {
      ({ data: response } = await axios.get(encodeURI(requestUrl)));
    } catch (e) {
      console.error(`Something went wrong during fetch ${requestUrl} | ${e}`);
      return;
    }
    const $ = cheerio.load(response);
    const pageUrl = encodeURI($('li.list-news a[title*="ข้าวเปลือกเจ้า พันธุ์สุพรรณบุรี"]').attr('href'));
    this.push({ pageUrl });
  }
}

interface Params {
  pageUrl: string
}

interface Entry {
  date: string,
  grade?: string,
  pageUrl: string,
  priceAvg: number,
  product: string,
  unit: string,
  country: string,
  currency: string,
  type: string,
}

class OaeConsumer extends Consumer {
  async consume(metaData: Params) {
    moment.locale('th');
    let response: any;
    try {
      ({ data: response } = await axios.get(metaData.pageUrl));
    } catch (e) {
      console.error(`${metaData.pageUrl} | ${e}`);
      return;
    }
    const entries: Array<Price> = [];
    const $ = cheerio.load(response);
    const rawUnit = $('div[align="right"]').eq(1).text().trim();
    const product = $('.xl110').eq(1).text().trim();
    const [unitTag, unit] = rawUnit.split(/\s*:\s*/);
    const rawYear = $('.xl110').eq(0).text().replace(/[^\d]/g, '');
    const rawMonth = $('.xl97').eq(0).text().trim();

    await this.assert([
      [product === 'ข้าวเปลือกเจ้า พันธุ์สุพรรณบุรี', `'ข้าวเปลือกเจ้า พันธุ์สุพรรณบุรี' -> '${product}'`],
      [unitTag === 'หน่วย', `'หน่วย' -> ${unitTag}`],
      [!!rawYear, 'year is not exist'],
      [!!rawMonth, 'month is not exist'],
    ]);

    const year = Number(rawYear) - THAI_SOLAR_CALENDER;
    const month = moment(rawMonth, 'MMMM').format('MM');

    $('tr.xl65').each((_i, tr) => {
      const rawDay = $(tr).find('td').eq(1).text().trim();
      if (rawDay) {
        const day = rawDay.padStart(2, '0');
        $(tr).find('td').slice(2).each((tdIndex, td) => {
          const priceText = $(td).text().replace(/[^\d.]/g, '');
          const priceAvg = Number(priceText);
          const grade = $('tr').eq(1).find('th').eq(tdIndex).text();
          if (priceAvg) {
            const date = `${year}-${month}-${day}`;
            const entry = {
              date,
              grade,
              pageUrl: metaData.pageUrl,
              priceAvg,
              product,
              unit,
              country: 'TH',
              currency: 'THB',
              type: 's',
            };
            entries.push(entry);
          }
        });
      }
    });
    console.info(`Total ${entries.length} of data will be push into DB`);
    await this.push(entries);
  }
}

export {
  OaeProducer as Producer,
  OaeConsumer as Consumer,
};
