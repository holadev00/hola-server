export interface RegisterPayloadEntity {
    displayname: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    avatar?: string;
}
