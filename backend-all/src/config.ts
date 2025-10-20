console.log(process.env.DATABASE_USERNAME)
export const config = {
  morganLogger:
    ':date[web] :method :url :status :res[content-length] - :response-time ms',
  port: process.env.PORT,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'assetchain_bridge',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
};
