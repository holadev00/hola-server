

export type SessionPayloadEnitity = {
    client: string;
    users: {
        id: string;
        timestamp: number;
    }[];
};
