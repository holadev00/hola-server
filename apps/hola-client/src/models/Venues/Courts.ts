import mongoose from "mongoose";

export const CourtSchema = new mongoose.Schema(
    {
        venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },

        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        sport: {
            type: String,
            required: true,
            index: true
            // ex: "football", "basket", "tennis"
        },

        indoor: {
            type: Boolean,
            default: false
        },

        filmed: {
            type: Boolean,
            default: false
            // terrain filmé / livestream / VAR / replay
        },

        active: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

CourtSchema.index({ venue: 1, active: 1 });

export const Courts = mongoose.model("Court", CourtSchema);