import { User } from "../../../models/User";
import { schemas } from "../../../validation/auth";
import * as passwords from "../../../passwords";
import { Sessions } from "../../../models";
import mongoose from "mongoose";
import { Preferences } from "../../../models/Preferences";
import { Files } from "../../../models/Files";
import mime from 'mime-types';
import path from "path";
import fs from "fs";

export async function validate(s, { username, email, password, password_confirm, phone }, callback) {
    try {
        if (!username || !email || !password || !password_confirm || !phone) return callback({ error: "Missing fields" });
        if (password !== password_confirm) return callback({ error: "Passwords do not match" });

        async function _checkUsernameInDB(username) {
            return new Promise((resolve, reject) => {
                User.findOne({ username }).then((user) => {
                    if (user) return resolve(true);
                    resolve(false);
                });
            });
        }

        async function _checkEmailInDB(email) {
            return new Promise((resolve, reject) => {
                User.findOne({ email }).then((user) => {
                    if (user) return resolve(true);
                    resolve(false);
                });
            });
        }

        async function _checkPhoneInDB(phone) {
            return new Promise((resolve, reject) => {
                User.findOne({ phone }).then((user) => {
                    if (user) return resolve(true);
                    resolve(false);
                });
            });
        }

        const usernameExists = await _checkUsernameInDB(username)
        if (usernameExists) return callback({ error: "Username already in use" });

        const emailExists = await _checkEmailInDB(email)
        if (emailExists) return callback({ error: "Email already in use" });

        const phoneExists = await _checkPhoneInDB(phone)
        if (phoneExists) return callback({ error: "Phone already in use" });

        const { error } = schemas.signup.validate({ username, email, phone, password, password_confirm }, { abortEarly: false });
        if (error) return callback({ error: error.details[0].message });

        callback({ success: true });
    } catch (error) {
        callback({ error: "Error validating form" });
    }
}

export async function register(s, { user, lang, preferences, private: isPrivate }, callback) {
    try {
        console.log(user);

        let createdAvatar;

        if (user.avatar) {
            createdAvatar = await saveFileFromBuffer(user.avatar, {
                originalName: "avatar.png", // helps mime-types
            }, s.session?.client);
        }

        const createdUser = await User.create({
            ...user,
            avatar: createdAvatar?._id,
            password: await passwords.hash(user.password),
            private: isPrivate,
        });

        await Sessions.findOneAndUpdate({
            client: new mongoose.Types.ObjectId(s.session?.client),
            user: createdUser._id,
        }, {
            $set: {
                lang,
                active: true,
            }
        }, { upsert: true, new: true });

        await Preferences.findOneAndUpdate({
            user: createdUser._id,
        }, {
            $set: {
                ...preferences,
            }
        }, { upsert: true, new: true });

        callback({ success: true });
    } catch (error) {
        console.error(error);
        callback({ error: "Error registering user" });
    }
}

export async function onBoardingEnd(s, callback) {
    s.session.refresh();
    callback({ success: true });
}

export async function saveFileFromBuffer(buffer, options = {}, client) {
    if (!Buffer.isBuffer(buffer)) return null;

    const {
        baseDir = path.resolve(__dirname, "../../../../files"),
        originalName = "file",
    } = options;

    // detect mime type
    const mimeType = mime.lookup(originalName) || "application/octet-stream";
    const extension = mime.extension(mimeType) || "bin";

    // date-based folders
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const dir = path.join(baseDir, year.toString(), month, day);
    await fs.promises.mkdir(dir, { recursive: true });

    // filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 100000)}.${extension}`;
    const filePath = path.join(dir, filename);

    // write file
    await fs.promises.writeFile(filePath, buffer);

    // save File document
    const fileDoc = await Files.create({
        name: originalName,
        path: `${path.join(year.toString(), month, day)}/${filename}`,
        mimeType,
        size: buffer.length,
        client: new mongoose.Types.ObjectId(client),
    });

    return fileDoc;
}