import mongoose from "mongoose";

if (!process?.env?.MONGO_URL) {
    throw new Error("MONGO_URL is not defined");
}
await mongoose.connect(process?.env?.MONGO_URL);

export { mongoose };