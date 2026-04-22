export interface UsersRepositoryPort {
    findUserByIdentifier(identifier: string): Promise<{ id: string; } | null>;
    createUser({ username, displayname, email, password }: { username: string; displayname: string; email: string; password: string; }): Promise<{ id: string; } | null>;
    searchUsers(user: string, query: string): Promise<{ id: string; username: string; displayname: string }[]>
}