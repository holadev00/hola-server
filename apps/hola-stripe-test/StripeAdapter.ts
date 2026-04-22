import Stripe from "stripe";


interface CreateSessionProps {
    origin: string;
    currency: string;
    amount: number;
    quantity: number;
    venue: string;
    locale?: string;
    email?: string;
}

export default class StripeAdapter {
    private stripe: Stripe;

    constructor(private secretKey: string, private publishableKey: string) {
        this.stripe = new Stripe(this.secretKey);
    }

    fetchPublishableKey() {
        return this.publishableKey;
    }

    async createSession({ origin, currency, amount, quantity, venue, locale = "fr", email }: CreateSessionProps) {
        const session: Stripe.Response<Stripe.Checkout.Session> = await this.stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: 'Reservation match',
                        },
                        unit_amount: amount * 100,
                    },
                    quantity,
                },
            ],
            locale: locale.split('-')[0] ?? "auto",
            /*payment_method_types: ['card'],*/
            mode: 'payment',
            ui_mode: 'embedded_page',
            automatic_tax: { enabled: true },
            redirect_on_completion: "if_required",
            customer_email: email,
            return_url: `${origin}/matches/@${venue}/return`,
        });

        return {
            checkoutSessionClientSecret: session.client_secret,
            checkoutSessionId: session.id
        };
    }

    async retrieveSession(sessionId: string) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        if (!session) throw new Error("Session not found");
        return session;
    }
}
