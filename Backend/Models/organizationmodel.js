
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    organizationId: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    email: String,
    status: {
        type: String,
        default: "active"
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "Organization",
    organizationSchema
);
