export const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        manager BOOLEAN DEFAULT false,
        provider VARCHAR(255),
        providerId VARCHAR(255),
        username VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        phone VARCHAR(255),
        avatar VARCHAR(255),

        UNIQUE (provider, providerId),
        UNIQUE (email),
        UNIQUE (phone),
        UNIQUE (username)
    );
`;