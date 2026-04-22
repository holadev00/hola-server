import { validateLoginForm } from "../../../validation/auth";

export const _validateForm = async ({ identifiant, password }) => {
    const { error, value } = validateLoginForm(identifiant, password);
    if (error) {
        throw {
            code: 'VALIDATION_ERROR',
            errors: error.details.map(d => ({
                field: d.path[0],
                message: d.message,
            })),
        };
    }
    return value;
};
