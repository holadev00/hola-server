import * as passwords from "../../../passwords";

export const _checkPassword = async (user, form) => {
    if (!await passwords.compare(form.password ?? '', user.password ?? '')) {
        throw {
            code: 'PASSWORD_INCORRECT',
            message: 'Password incorrect',
        };
    }
};
