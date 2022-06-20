import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

import { Producer } from "../../modules/util";

const THAI_SOLAR_CALENDER = 543;
const requestUrl = 'https://www.oae.go.th/view/1/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%81%E0%B8%A9%E0%B8%95%E0%B8%A3/TH-TH';

class testProducer extends Producer {
  async produce() {
    let response: any;
    try {
      ({ data: response } = await axios.get(requestUrl));
    } catch (e) {
      console.error(`Something went wrong during fetch ${requestUrl} | ${e}`);
      return;
    }
    const $ = cheerio.load(response);
    const pageUrl = encodeURI($('li.list-news a[title*="ทุเรียน"]').attr('href'));
    await this.push({ pageUrl });
  }
}

interface Params {
  pageUrl: string
}

class testConsumer {
  async consume(metaData: Params) {
    moment.locale('th');
    const { pageUrl } = metaData;
    let response: any;
    try {
      ({ data: response } = await axios.get(pageUrl));
    } catch (e) {
      console.error(`Something went wrong during fetch ${pageUrl} | ${e}`);
      return;
    }
    const entries = []
    const $ = cheerio.load(response);
    const rawUnit = $('div[align="right"]').eq(1).text().trim();
    const product = $('.xl110').eq(1).text().trim();
    const [unitTag, unit] = rawUnit.split(/\s*:\s*/);
    const rawYear = $('.xl110').eq(0).text().replace(/[^\d]/g, '');
    const rawMonth = $('.xl97').eq(0).text().trim();
    const year = Number(rawYear) - THAI_SOLAR_CALENDER;
    const month = moment(rawMonth, 'MMMM').format('MM');

    const tableHeaderTexts: string[][] = [[], [], [], []];

    $('tr.xl70').each((trIndex, tr) => {
      $(tr).find('th').each((thIndex, th) => {
        const thColSpan = Number($(th).attr('colspan')) || 1;
        const thText = $(th).text().replace(/\s+/g, ' ').trim();
        console.log(thColSpan, thText);
        for (let i = 0; i < thColSpan; i += 1) {
          tableHeaderTexts[trIndex].push(thText)
        }
      })
    })

    $('tr.xl65').each((_i, tr) => { 
      const rawDay = $(tr).find('td').eq(1).text().trim(); 
      if (rawDay) { 
        const day = rawDay.padStart(2, '0'); 
        const date = `${year}-${month}-${day}`; 
        $(tr).find('td').slice(2).each((tdIndex, td) => {
          const grade = tableHeaderTexts[3][tdIndex];
          const priceText = $(td).text().replace(/[^\d.]/g, '');
          const priceAvg = Number(priceText);
          const region = `${tableHeaderTexts[0][tdIndex]}, ${tableHeaderTexts[1][tdIndex]}, ${tableHeaderTexts[2][tdIndex]}`;
          console.log(`
            currency: THB,
            country: TH,
            date: ${date}, 
            grade: ${grade},
            pageUrl: ${pageUrl},
            priceAvg: ${priceAvg},
            product: ${product}, 
            region: ${region},
            unit: ${unit},
            type: w,
          `); 
        })
      } 
    }); 
  }
}

export {
  testProducer as Producer,
  testConsumer as Consumer,
}
