import { createConnection, Connection } from 'typeorm';
import { join, resolve } from 'path';

const connectToDatabase = async (): Promise<Connection> => {
  if (process.env.ENVIRONMENT === 'PROD') {
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
    return await createConnection({
      type: 'mysql',
      socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [join(resolve(__dirname, '..'), 'entity', '**', '*.{ts,js}')],
      migrations: [
        join(resolve(__dirname, '..'), 'migration', '**', '*.{ts,js}')
      ]
    });
  } else {
    return await createConnection({
      type: 'mysql',
      host: process.env.DB_HOSTNAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [join(resolve(__dirname, '..'), 'entity', '**', '*.{ts,js}')],
      migrations: [
        join(resolve(__dirname, '..'), 'migration', '**', '*.{ts,js}')
      ],
      logging: 'all'
    });
  }
};

export default connectToDatabase;
