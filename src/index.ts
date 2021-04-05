import 'reflect-metadata';

import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';

import connectToDatabase from './databaseConfig.ts/databaseConfig';

config();

async function main() {
  const app = express();
  console.log(process.env);
  const connection = await connectToDatabase();

  await connection.runMigrations();
  app.use(cors());
  app.get('/', (req, res) => {
    return res.status(200).send('Hello world!');
  });

  const port = process.env.PORT || 5000;
  app.listen(port);
}

main().catch(console.error);
