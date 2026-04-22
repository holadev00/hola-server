import type { Socket } from "socket.io";
import { stripe } from "../../stripe";
import type Stripe from "stripe";

export function fetchPublishableKey(socket, cb) {
    cb(process.env.STRIPE_PUBLISHABLE_KEY);
}

export async function checkoutSession(socket: Socket, { venue, currency = "EUR", amount, quantity }, cb) {
    console.log('checkoutSession', currency, amount, quantity, socket.handshake.headers.origin);

    const session: Stripe.Response<Stripe.Checkout.Session> = await stripe.checkout.sessions.create({
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
        locale: 'fr',
        //payment_method_types: ['card', 'apple_pay', 'google_pay'],
        mode: 'payment',
        ui_mode: 'embedded',
        automatic_tax: {enabled: true},
        redirect_on_completion: "if_required",
        //customer_email: 'u0Bb9@example.com',
        //redirect: "if_required",
        // The URL of your payment completion page
        return_url: `${socket.handshake.headers.origin}/matches/@${venue}/return`,
    });

    console.log({
        checkoutSessionClientSecret: session.client_secret,
        checkoutSessionId: session.id,
    });

    cb({
        checkoutSessionClientSecret: session.client_secret,
        checkoutSessionId: session.id
    });
}