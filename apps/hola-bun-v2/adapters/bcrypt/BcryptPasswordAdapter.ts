import bcrypt from "bcrypt";

export class BcryptPasswordAdapter implements AuthPasswordPort {
    constructor(private saltRounds: number = 10) { }

    /**
     * Hash un mot de passe
     */
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Compare un mot de passe en clair avec un hash
     */
    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
