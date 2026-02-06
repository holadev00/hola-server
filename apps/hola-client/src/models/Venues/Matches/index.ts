import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Court",
        required: true
    },

    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "mixed"],
        required: true
    },

    date: {
        type: String, // YYYY-MM-DD
        required: true
    },

    start: {
        type: Number, // heure décimale ou minutes (voir note)
        required: true
    },

    end: {
        type: Number,
        required: true
    },

    private: {
        type: Boolean,
        default: false
    },

    active: {
        type: Boolean,
        default: true
    },

    createdBy: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true
        }
    },

    description: String
}, { timestamps: true });

MatchSchema.index({ court: 1, date: 1 });

MatchSchema.virtual('participations', {
    ref: 'Participation',
    localField: '_id',
    foreignField: 'match',
    justOne: false
})

export const Matches = mongoose.model("Match", MatchSchema);
