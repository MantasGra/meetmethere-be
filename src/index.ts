import 'reflect-metadata';

import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

import connectToDatabase from './databaseConfig/databaseConfig';
import rootRouter from './routes';
import { errorHandler } from './utils/route-handlers';

config();

async function main() {
  const app = express();
  const connection = await connectToDatabase();

  await connection.runMigrations();
  app.use(
    cors({
      origin: process.env.CROSS_ORIGINS.split(',').map((origin) =>
        origin.trim()
      ),
      credentials: true
    })
  );
  app.use(json());
  app.use(cookieParser());
  app.use(
    csurf({
      cookie: true
    })
  );
  app.get('/csrf', (req, res) => res.send({ csrfToken: req.csrfToken() }));
  app.use(rootRouter);
  app.use(errorHandler);

  const port = process.env.PORT || 5000;
  app.listen(port);
}

main().catch(console.error);
