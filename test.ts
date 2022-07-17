import cheerio from 'cheerio';
import request from 'modules/request';

interface requestInfo {
  Referer: string,
  className: string,
}

(async() => {
  const requestInfos: Array<requestInfo> = [
    {
      className: 'cms.pressrelease',
      Referer: 'https://www.wineaustralia.com/news/media-releases',
    },
    {
      className: 'cms.news',
      Referer: 'https://www.wineaustralia.com/news/articles',
    },
    {
      className: 'wa.marketbulletin',
      Referer: 'https://www.wineaustralia.com/news/market-bulletin',
    },
  ]

  for (const requestInfo of requestInfos) {
    let pageSize = 12;
    const { className, Referer } = requestInfo;
    let response = await request({
      method: 'POST',
      url: 'https://www.wineaustralia.com/api/global/azuresearch',
      headers: {
        Referer,
        'Content-Type': 'application/json',
      },
      body: {
        className,
        pageSize,
        page: 1,
        sort: 'newest',
        filters: [],
        globalCategory: 'News',
      },
      type: 'json',
    });
    pageSize = response.totalResults;

    response = await request({
      method: 'POST',
      url: 'https://www.wineaustralia.com/api/global/azuresearch',
      headers: {
        Referer,
        'Content-Type': 'application/json',
      },
      body: {
        className,
        pageSize,
        page: 1,
        sort: 'newest',
        filters: [],
        globalCategory: 'News',
      },
      type: 'json',
    });

    console.log(response.results.length, response.totalResults);
  }
})()
