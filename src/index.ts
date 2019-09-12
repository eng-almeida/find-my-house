import dotenv from 'dotenv';
import mongoose from 'mongoose';
import scrapeImovirtual from './scrapers/imovirtual';
import { Rental } from './types/rental/rental.model';
import RentalInterface from './types/rental/rental.interface'

dotenv.config();

const mongoDBName = process.env.MONGODB_NAME;
const mongoDBUser = process.env.MONGODB_USER;
const mongoDBPassword = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${mongoDBUser}:${mongoDBPassword}@cluster0-kksmq.mongodb.net/${mongoDBName}?retryWrites=true&w=majority`, { useNewUrlParser: true });

const db  = mongoose.connection;
const startScrapping = async () => {
  const imovirtualResults = await scrapeImovirtual();
    imovirtualResults.map((result: RentalInterface) => {
    const rental = new Rental(result);
    rental.save()
      .then(() => { console.log('Notify User'); })
      .catch((err: {}) => {
        console.log(err);
      });  
  });
}


db.on('open', startScrapping);