import mongoose from "mongoose";

export const ScheduleSchema = new mongoose.Schema(
    {
        venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
        // 0 = dimanche, 6 = samedi (ISO simple)
        weekDay: {
            type: Number,
            min: 0,
            max: 6,
            required: function () {
                return !this.date;
            }
        },

        // override ponctuel (YYYY-MM-DD)
        date: {
            type: String,
            match: /^\d{4}-\d{2}-\d{2}$/,
            required: function () {
                return this.weekDay === undefined;
            }
        },

        // heure en minutes (ex: 9h30 = 570)
        start: {
            type: Number,
            min: 0,
            max: 1440
        },

        end: {
            type: Number,
            min: 0,
            max: 1440,
            validate: {
                validator: function (v) {
                    return this.start == null || v > this.start;
                },
                message: 'end must be greater than start'
            }
        },

        // créneaux disponibles (minutes depuis 00:00)
        slots: {
            type: [Number],
            default: []
        },

        closed: {
            type: Boolean,
            default: false
        },

        reason: {
            type: String,
            trim: true
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    { _id: false }
);

export const Schedules = mongoose.model("Schedule", ScheduleSchema);