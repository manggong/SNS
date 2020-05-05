import * as dotenv from "dotenv";

dotenv.config();

type Config = {
  username: string;
  password: string;
  database: string;
  host: string;
  [key: string]: string;
};

interface IConfigGroup {
  development: Config;
  test: Config;
  production: Config;
}

const config: IConfigGroup = {
  development: {
    username: "root",
    password: process.env.DB_PASSWORD!,
    database: "nodebird",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: process.env.DB_PASSWORD!,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: process.env.DB_PASSWORD!,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
  }
};

export default config;
