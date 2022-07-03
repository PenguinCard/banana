import Fastify from 'fastify';
import mongo from '@fastify/mongodb';

const fastify = Fastify({
  logger: true,
})

fastify.register(mongo, {
  forceClose: true,
  url: 'mongodb://localhost:27017/mydb',
})

fastify.get('/', async (_req, res) => {
  res.send({ hello: 'world' });
})

fastify.get('/price/all', function (_req, res) {
  const prices = this.mongo.db.collection('prices');
  console.log(prices);
  const rst = prices.find({});
  res.send(rst);
})

fastify.listen({ port: 9999 }, (err, address) => {
  if (err) throw new Error(`${address} ${err}`);
})
