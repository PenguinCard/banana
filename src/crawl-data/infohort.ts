import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { Producer } from "../modules/util";

const requestUrl = 'https://agriculture.canada.ca/en/market-information-system/rp/index.cfm?action=rR&promptLevel=3&debugcodes=0&p_404_all=1&report_format_type_code=41&btnNext=Next&p_415=87&r=318&p_401=2020&p_402=202012&p_403=20201230#wb-cont';

class InfohortProducer extends Producer {
  async produce() {
    const broswer = await puppeteer.launch({ headless: true });
    const pages = await broswer.pages();
    const page = pages[0];

    await page.goto(requestUrl);
    await page.waitForSelector('.btn.btn-info', { visible: true });
    await page.click('.btn.btn-info');
    await page.waitForNavigation();
    const html = await page.content();

    this.push({ html });
  }
}

interface Params {
  html: string
}

class InfohortConsumer {
  async consume(metaData: Params) {
    const { html } = metaData;
    const $ = cheerio.load(html);

    $('tbody').find('tr').slice(2).each((i, tr) => {
      if(i === 0) {
        console.info($(tr).text())
      }
    })
  }
}

export {
  InfohortProducer as Producer,
  InfohortConsumer as Consumer,
}
