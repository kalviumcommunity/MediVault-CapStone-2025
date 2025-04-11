const mongoose = require("mongoose");

const stockItemSchema = new mongoose.Schema({
    stockName: {
        type: String,
        required: [true, "Stock name is required"],
        trim: true
    },
    suplierName: {
        type: String,
        required: [true, "Supplier name is required"],
        trim: true
    },
    orderedDate: {
        type: Date,
        required: [true, "Ordered date is required"]
    },
    deliveredDate: {
        type: Date,
        required: [true, "Delivered date is required"],
        validate: {
            validator: function(value) {
                return value >= this.orderedDate;
            },
            message: "Delivered date must be after ordered date"
        }
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
    },
    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"],
        validate: {
            validator: function(value) {
                return value > this.manufacturingDate;
            },
            message: "Expiry date must be after manufacturing date"
        }
    },
    manufacturingDate: {
        type: Date,
        required: [true, "Manufacturing date is required"]
    },
    netPrice: {
        type: Number,
        required: [true, "Net price is required"],
        min: [0, "Price cannot be negative"]
    },
    batchNumber: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const stockSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: [true, "User email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email address"]
    },
    stock: [stockItemSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});


stockSchema.index({ "stock.stockName": "text", "stock.suplierName": "text" });

const Stock = mongoose.model("Stock", stockSchema);
module.exports = Stock;