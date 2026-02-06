import Joi from 'joi';

/**
 * Email
 */
const email = Joi
    .string()
    .email({ tlds: { allow: false } });

/**
 * Pseudo (lettres, chiffres, _, .)
 */
const username = Joi
    .string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_.-]+$/);

/**
 * Numéro (format international recommandé)
 */
const phone = Joi
    .string()
    .pattern(/^\+?[0-9]{8,15}$/);

export const identifiant = Joi.alternatives()
    .try(email, username, phone)
    .required()
    .messages({
        'alternatives.match': 'Identifiant invalide (email, pseudo ou numéro)',
        'any.required': 'Identifiant requis',
        'string.empty': 'Identifiant requis',
    });

export const loginPassword = Joi.string()
    .required()
    .messages({
        'any.required': 'Mot de passe requis',
        'string.empty': 'Mot de passe requis',
    });

export const password = loginPassword
    .min(8)
    .max(255)
    .trim()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
        'string.empty': 'Mot de passe requis',
        'string.min': 'Mot de passe trop court (8 caractères minimum)',
        'string.max': 'Mot de passe trop long (255 caractères maximum)',
        'string.pattern': 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère special',
        'any.required': 'Mot de passe requis',
    });

export const schemas = {
    login: Joi.object({
        identifiant,
        password: loginPassword,
    }),
};

export function validateLoginForm(identifiant: any, password: any): { error: any; value: any; } {
    return schemas.login.validate(
        { identifiant, password },
        { abortEarly: false }
    );
}
