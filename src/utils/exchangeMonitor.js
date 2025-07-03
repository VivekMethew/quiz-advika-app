require("dotenv").config();
const axios = require("axios");
exports.exchangeMonitor = async () => {
  try {
    const response = await axios.get(process.env.EXCH_URL, {
      params: {
        api_key: process.env.EXCH_API_KEY,
        from: process.env.EXCH_FROM,
        to: process.env.EXCH_TO,
        amount: process.env.EXCH_AMOUNT,
      },
    });
    return response;
  } catch (error) {
    return error.message;
  }
};
