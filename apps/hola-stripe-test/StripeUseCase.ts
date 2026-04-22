export class StripeUseCase {
    private adapter: {
        fetchPublishableKey: Function;
        createSession: Function;
    };

    constructor({ adapter }) {
        this.adapter = adapter;
    }

    fetchPublishableKey() {
        return this.adapter.fetchPublishableKey();
    }
    createSession({ origin, currency, amount, quantity, venue, locale }: {
        origin: string;
        currency: string;
        amount: number;
        quantity: number;
        venue: string;
        locale: string;
    }) {
        return this.adapter.createSession({
            origin,
            currency,
            amount,
            quantity,
            venue,
            locale
        });
    }
}
