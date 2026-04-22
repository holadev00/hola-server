/**
 * Cas d'utilisation pour la gestion de l'authentification.
 */
export class AuthSocialLoginUseCase implements AuthLoginUseCasePort {
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
        private sessionsRepository: SessionRepositoryPort,
    ) { }

    /**
     * Connecte un utilisateur avec ses identifiants.
     *
     * @param credentials Identifiants de connexion
     * @param credentials.client Identifiant de session
     * @param credentials.identifier Identifiant utilisateur (email ou username)
     * @param credentials.password Mot de passe en clair
     *
     * @returns Un objet contenant le token JWT ou une erreur
     */
    async execute({ client, provider, providerId }: { client: string; provider: string; providerId: string; }) {
        try {
            const user = await this.usersRepository.findOrCreateUserByProviderId(provider, providerId);

            await this.sessionsRepository.addSession(client, user.id);
        } catch (error: any) {
            return { error: error.message };
        }
    }
}

