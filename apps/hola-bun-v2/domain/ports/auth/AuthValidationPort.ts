
export interface AuthValidationPort {
    /**
     * Valide les données de connexion
     */
    login(data: { identifier: string; password: string; }): Promise<void>;

    /**
     * Valide les données d'inscription
     */
    register(data: {
        displayname: string;
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<void>;
}
