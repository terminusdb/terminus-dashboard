// config.js
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  endpoint: process.env.API_URL,
  apiKey: process.env.API_KEY
};