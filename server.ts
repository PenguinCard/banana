import Fastify from 'fastify';
import mongo from '@fastify/mongodb';

const app = Fastify({
  logger: true,
})

app.register(mongo, {
  forceClose: true,
  url: 'mongodb://localhost:27017/mydb',
})

app.get('/', async (_req, res) => {
  res.send({ hello: 'world' });
})

app.get('/price/all', async (_req, res) => {
  const prices = app.mongo.db.collection('prices');
  const rst = await prices.find({}).toArray();
  res.send(rst);
})

app.listen({ port: 9999 }, (err, address) => {
  if (err) throw new Error(`${address} ${err}`);
})
