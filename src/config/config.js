const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/../.env` });

module.exports = {
  database: {
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
  },
};
