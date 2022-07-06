import { model, Schema } from 'mongoose';

const PriceSchema = new Schema({
  task: String,
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
  variety: String,
  type: String,
  created_at: {
    type: Date,
    default: new Date(),
  },
});

export default model('prices', PriceSchema);
