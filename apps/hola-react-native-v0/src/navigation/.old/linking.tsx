const config = {
    screens: {
        Home: { path: '', },
        Matches: {
            path: 'matches',
            screens: {
                Index: { path: '', },
                Venue: {
                    path: ':venue',
                    screens: {
                        Index: { path: '', },
                        Details: { path: ':match', },
                        Request: { path: ':match/request', },
                        Create: {
                            path: 'create',
                            screens: {
                                IndexCrea: { path: '', },
                                Options: { path: 'options', },
                                Checkout: { path: 'checkout', },
                            }
                        }
                    }
                },
            }
        },
    },
};

export default {
    prefixes: [],
    config
};