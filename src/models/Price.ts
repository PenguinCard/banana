import { model, Schema } from 'mongoose';

const PriceSchema = new Schema({
  country: String,
  currency: String,
  date: String,
  grade: String,
  priceAvg: String,
  priceMax: String,
  priceMin: String,
  product: String,
  region: String,
  unit: String,
  type: String,
})

export default model('prices', PriceSchema);
