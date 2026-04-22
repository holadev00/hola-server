// models/CourtPricing.js
import mongoose from "mongoose";

const CourtPricingSchema = new mongoose.Schema({
    courts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true }], // Courts concernés (ex: tous les 5v5 d’un même centre)
    type: { type: String, enum: ["PEAK", "PREMIUM"], required: true }, // PEAK | PREMIUM
    startHour: { type: Number, min: 0, max: 23, required: true }, // Créneau horaire
    endHour: { type: Number, min: 1, max: 24, required: true },
    pricePerPlayerPerHour: { type: Number, min: 0, required: true }, // €/joueur/heure
    dayOfWeek: { type: [Number], validate: v => !v || v.every(d => d >= 0 && d <= 6) }, // 0 = dimanche → 6 = samedi

    // Période de validité
    validFrom: Date,
    validTo: Date,

    active: { type: Boolean, default: true }
}, { timestamps: true });

/*CourtPricingSchema.index({
    courts: 1,
    type: 1,
    startHour: 1,
    endHour: 1,
    dayOfWeek: 1,
    validFrom: 1,
    validTo: 1
});*/

export default mongoose.model("CourtPricing", CourtPricingSchema);
