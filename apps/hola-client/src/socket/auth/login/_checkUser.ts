import { checkUserByIdentifiant } from "../../../models/User";

export const _checkUser = async ({ identifiant }) => {
    const user = await checkUserByIdentifiant(identifiant);
    if (!user) {
        throw {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
        };
    }
    return user;
};
