import type { AuthPasswordPort } from "../../domain/ports/auth/AuthPasswordPort";
import type { AuthValidationPort } from "../../domain/ports/auth/AuthValidationPort";
import type { UsersRepositoryPort } from "../../domain/ports/auth/UsersRepositoryPort";
import type { SessionRepositoryPort } from "../../domain/ports/auth/SessionRepositoryPort";

/**
 * Cas d'utilisation pour la gestion de l'authentification.
 */
export class AuthRegisterUseCase {
    /**
     * Initialise le cas d'utilisation d'authentification.
     *
     * @param password Service de gestion des mots de passe (hash / comparaison)
     * @param validation Service de validation des données d'authentification
     * @param usersRepository Repository d'accès aux données utilisateur
     * @param sessionsRepository Repository d'accès aux données de session
     */
    constructor(
        private password: AuthPasswordPort,
        private validation: AuthValidationPort,
        private usersRepository: UsersRepositoryPort,
        private sessionsRepository: SessionRepositoryPort
    ) { }

    /**
     * Inscrit un nouvel utilisateur.
     *
     * @param details Informations d'inscription
     * @param details.username Nom d'utilisateur
     * @param details.email Adresse email
     * @param details.password Mot de passe en clair
     * @param details.password_confirmation Confirmation du mot de passe
     *
     * @returns Un objet contenant le token JWT ou une erreur
     */
    async execute({
        client,
        displayname,
        username,
        email,
        password,
        password_confirmation,
        avatar
    }: {
        client: string;
        displayname: string;
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
        avatar: string;
    }) {
        try {
            const existingEmail = await this.usersRepository.findUserByIdentifier(email);
            const existingUsername = await this.usersRepository.findUserByIdentifier(username);

            await this.validation.register({ displayname, username, email, password, password_confirmation });

            if (existingEmail || existingUsername) {
                throw new Error('Utilisateur existant');
            }

            if (password !== password_confirmation) {
                throw new Error('Les mots de passe ne correspondent pas');
            }

            // 🔐 Hash du mot de passe avant stockage
            const hashedPassword = await this.password.hash(password);

            const user = await this.usersRepository.createUser({
                displayname,
                username,
                email,
                password: hashedPassword,
                avatar
            });

            await this.sessionsRepository.addSession(client, user.id);
        } catch (error: any) {
            console.error(error);

            return { error: error.message };
        }
    }
}

