const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExchangeRateSchema = new Schema(
    {
        fromCurrency: {
            type: String,
            default: "USD"
        },
        toCurrency: {
            type: String,
            default: "INR"
        },
        unit: {
            type: Number, default: 1
        },
        amount: {
            type: Number, required: true
        },
        isDeleted: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);




const ExchangeRateModel = mongoose.model('ExchangeRate', ExchangeRateSchema);

module.exports = ExchangeRateModel;
