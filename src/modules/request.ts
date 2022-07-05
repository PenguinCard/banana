interface Args {
  url: string,
  type?: string,
  method?: string,
}

export default async function request(args: string | Args) {
  let response: Response;
  let url: string;
  let method: string = 'GET';
  let type: string = 'text';

  try {
    if (typeof args === 'string') {
      url = args;
      response = await fetch(args);
    } else {
      ({ method = 'GET', type = 'text', url } = args);
      response = await fetch(url, {
        method,
      });
    }

    if (response.status !== 200) {
      throw new Error(`response error ${response.status} ${response.statusText}`);
    }

    switch (type) {
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
    throw new Error(`error(url: ${url}): ${e}`);
  }
}
