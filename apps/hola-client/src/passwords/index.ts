import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
if (!SALT_ROUNDS) {
    throw new Error('SALT_ROUNDS is not defined');
}

export const hash = async (plainPassword) => {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS!);
};

export const compare = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};