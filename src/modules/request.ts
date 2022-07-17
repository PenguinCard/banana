interface Args {
  url: string,
  body?: string | object
  type?: string,
  method?: string,
  headers?: object,
}

export default async function request(args: string | Args) {
  let headerOptions;
  let bodyOptions;
  let response: Response;
  let url: string;
  let method: string = 'GET';
  let type: string = 'text';

  try {
    if (typeof args === 'string') {
      url = args;
      response = await fetch(args);
    } else {
      ({ method = 'GET', type = 'text', url, headers: headerOptions, body: bodyOptions } = args);
      const requestObject: any = { 
        method, 
      };
      if (bodyOptions) {
        bodyOptions = typeof bodyOptions === 'object' ? JSON.stringify(bodyOptions) : bodyOptions;
        const body: BodyInit = bodyOptions;
        requestObject.body = body;
      }
      if (headerOptions) {
        headerOptions = Object.entries(headerOptions).map(([key, value]) => [key, String(value)]); 
        const headers: HeadersInit = headerOptions;
        requestObject.headers = headers;
      }
      response = await fetch(url, requestObject);
    }

    if (!response.ok) {
      throw new Error(`response error ${response.status} ${response.statusText}`);
    }

    switch (type) {
      case 'blob':
        return response.blob();
      case 'buffer':
        return Buffer.from(await response.arrayBuffer());
      case 'text':
        return response.text();
      case 'json':
        return response.json();
      default:
        throw new Error('no type in request');
    }
  } catch (e) {
    console.error(`fetch error(url: ${url}) :${e}`);
    throw new Error(`error(url: '${url}' ): ${e}`);
  }
}
