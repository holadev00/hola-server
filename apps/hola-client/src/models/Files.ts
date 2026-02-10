import mongoose from "mongoose";

export const FilesSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    name: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    size: { type: Number, required: true },
});

export const Files = mongoose.model("File", FilesSchema);
