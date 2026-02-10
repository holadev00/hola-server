import mongoose from "mongoose";

export const PaymentSchema = new mongoose.Schema({
    stripeId: { type: String, required: true },
    participations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participation",
        required: true
    }]
}, { timestamps: true });

export const Payments = mongoose.model("Payment", PaymentSchema);