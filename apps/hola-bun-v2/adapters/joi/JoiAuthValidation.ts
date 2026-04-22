import Joi from "joi";

/**
 * Implémentation de la validation d'authentification avec Joi
 */

export class JoiAuthValidation implements AuthValidationPort {
    private phoneRegex = /^(\+?\d{1,3})?[0-9]{9,14}$/;

    private emailSchema = Joi.string().email().lowercase().trim();

    private phoneSchema = Joi.string().pattern(this.phoneRegex).trim();

    private usernameSchema = Joi.string().alphanum().min(3).max(30).trim();

    private displaynameSchema = Joi.string().min(3).max(30).trim();

    private identifierSchema = Joi.alternatives()
        .try(this.emailSchema, this.phoneSchema, this.usernameSchema)
        .required();

    /**
     * Validation login
     */
    async login(data: { identifier: string; password: string; }): Promise<void> {
        const schema = Joi.object({
            identifier: this.identifierSchema,
            password: Joi.string().min(6).required(),
        });

        const { error } = schema.validate(data);

        if (error) {
            throw new Error('Identifiants invalides');
        }
    }

    /**
     * Validation register
     */
    async register(data: {
        displayname: string;
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<void> {
        const schema = Joi.object({
            displayname: this.displaynameSchema.required().messages({
                'string.base': "Le nom d'utilisateur doit être une chaîne de caractères",
                'string.min': "Le nom d'utilisateur doit contenir au moins 3 caractères",
                'string.max': "Le nom d'utilisateur ne peut pas dépasser 30 caractères",
            }),
            username: this.usernameSchema.required().messages({
                'string.base': "Le nom d'utilisateur doit être une chaîne de caractères",
                'string.alphanum': "Le nom d'utilisateur doit contenir uniquement des lettres et chiffres",
                'string.min': "Le nom d'utilisateur doit contenir au moins 3 caractères",
                'string.max': "Le nom d'utilisateur ne peut pas dépasser 30 caractères",
                'any.required': "Le nom d'utilisateur est obligatoire",
            }),

            email: this.emailSchema.required().messages({
                'string.email': "L'adresse email n'est pas valide",
                'any.required': "L'email est obligatoire",
            }),

            password: Joi.string().min(6).required().messages({
                'string.base': 'Le mot de passe doit être une chaîne de caractères',
                'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
                'any.required': 'Le mot de passe est obligatoire',
            }),

            password_confirmation: Joi.any().valid(Joi.ref('password')).required().messages({
                'any.only': 'Les mots de passe ne correspondent pas',
                'any.required': 'La confirmation du mot de passe est obligatoire',
            }),
        });

        const { error } = schema.validate(data, {
            abortEarly: false, // 🔥 important pour récupérer toutes les erreurs
        });

        if (error) {
            const messages = error.details.map((err) => err.message);

            throw new Error(messages.join(' | '));
        }
    }
}
