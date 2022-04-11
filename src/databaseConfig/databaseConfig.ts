import { join, resolve } from 'path';
import { Connection, createConnection } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

const connectToDatabase = async (): Promise<Connection> => {
  const commonConfig: Pick<
    MysqlConnectionOptions,
    'type' | 'database' | 'username' | 'password' | 'entities' | 'migrations'
  > = {
    type: 'mysql',
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [join(resolve(__dirname, '..'), 'entity', '**', '*.{ts,js}')],
    migrations: [join(resolve(__dirname, '..'), 'migration', '**', '*.{ts,js}')]
  };
  if (process.env.ENVIRONMENT === 'PROD') {
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
    return await createConnection({
      socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
      ...commonConfig
    });
  } else {
    return await createConnection({
      host: process.env.DB_HOSTNAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      logging: 'all',
      ...commonConfig
    });
  }
};

export default connectToDatabase;
