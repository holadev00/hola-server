import { useMatchesScreensLinks } from "@hola/matches/hooks/useMatchesScreensLinks";
import { useVenue } from "@hola/matches/contexts/venuesScreen";
import { Computed, use$, useObservable, useObserveEffect } from "@legendapp/state/react";
import { createContext, use, useContext, useEffect } from "react";
import { useTranslation } from "hola-lang";
import { currentDay } from "../state";
import { ScrollView, Text, View } from "react-native";
import { spacing } from "@hola/ui";
import { observable } from "@legendapp/state";
import Button from "@hola/ui/components/Button";
import Title from "@hola/ui/components/Title";
import moment from "moment";
import { HolaStripeProvider } from "@hola/stripe";
import { PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout';
import { EmbeddedCheckout } from "@stripe/react-stripe-js"
import { appHotToast, appLoading } from "../../../../overlays";

const count = observable(1);

export function MatchCreationCheckoutScreen() {
    return <CheckoutScreens
        defaultScreen="counter"
        screens={{
            counter: <Counter />,
            checkout: <CheckoutPage />,
        }}
    />;
}

export function Counter() {
    const { t } = useTranslation();
    const { getAvailabilities, creationInput, venueID } = useVenue();
    const { createScreen, indexScreen } = useMatchesScreensLinks(venueID);
    const { setScreen } = useContext(CheckoutScreensContext);

    const daysFromNow = use$(currentDay);
    useEffect(function () {
        const off = getAvailabilities(daysFromNow);

        return off;
    }, [daysFromNow]);

    useEffect(function () {
        if (!venueID) {
            indexScreen();
            return;
        }

        if (!creationInput.selectedAvailability.get()) {
            console.log("MatchCreationCheckoutScreen no availability");
            createScreen();
        }

        return () => { };
    }, [venueID]);

    const min = 1;
    const max = 10;

    return <View style={{ padding: spacing.md, flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm }}>
        <Title>{t('matches.checkout')}</Title>

        <View style={{ padding: spacing.md, justifyContent: "center", alignItems: "center", gap: spacing.xs }}>
            <Text>{t('matches.checkout.nb_tickets')}</Text>
            <Computed>
                {() => <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center", marginVertical: spacing.sm }}>
                    <Button variant="secondary" disabled={count.get() <= min} onPress={() => count.set(count.get() - 1)}>-</Button>
                    <Text style={{ fontSize: 32 }}>{count.get()}</Text>
                    <Button variant="secondary" disabled={count.get() >= max} onPress={() => count.set(count.get() + 1)}>+</Button>
                </View>}
            </Computed>
            <Computed>
                {() => {
                    if (!creationInput.selectedAvailability.get()) {
                        createScreen();
                        return <></>;
                    }

                    const durationMin = (
                        creationInput.selectedAvailability.get()
                            ?.end -
                        creationInput.selectedAvailability.get()
                            ?.start
                    );

                    const duration = moment.duration(durationMin, "minutes");

                    return (<>
                        <Text>
                            {t("slot.pricePerPlayerPerHour", {
                                price:
                                    creationInput.selectedAvailability.get()
                                        ?.pricePerPlayerPerHour,
                                currency: t(
                                    `currency.${creationInput.selectedAvailability.get()?.currency ?? "EUR"}`,
                                ),
                            })}
                        </Text>
                        <Text>
                            {t("slot.duration", {
                                hours: duration.hours(),
                                minutes: duration.minutes().toString().padStart(2, "0"),
                            })}
                        </Text>
                        <Text>
                            {t("slot.priceTotal", {
                                price:
                                    count.get() *
                                    creationInput.selectedAvailability.get()
                                        ?.priceTotal,
                                currency: t(
                                    `currency.${creationInput.selectedAvailability.get()?.currency ?? "EUR"}`,
                                ),
                            })}
                        </Text>
                    </>)
                }}
            </Computed>
        </View>

        <Button onPress={() => setScreen(`checkout`)}>{t('matches.checkout.confirm')}</Button>
    </View>
}

export function CheckoutPage() {
    const { t } = useTranslation();
    const { venueID, creationInput, setMatch } = useVenue();
    const { createScreen, venueScreen } = useMatchesScreensLinks(venueID);
    const { setScreen } = useContext(CheckoutScreensContext);

    useObserveEffect(() => {
        if (!creationInput.selectedAvailability.get()) {
            createScreen();
        }
    }, [creationInput.selectedAvailability]);

    async function createMatch(checkoutSessionId) {
        console.log("createMatch", checkoutSessionId);

        appLoading.set(true);
        const { ok } = await setMatch(count.get(), checkoutSessionId);

        console.log(ok);

        if (ok) appHotToast.push({
            date: Date.now(),
            title: t("matches.created"),
            message: t("matches.created"),
            type: "success",
            duration: 3000
        }); else appHotToast.push({
            date: Date.now(),
            title: t("matches.error"),
            message: t("matches.error"),
            type: "error",
            duration: 3000
        });

        setTimeout(() => {
            appLoading.set(false);
            creationInput.set(null);
            if (ok) venueScreen();
        }, 3000);
    }

    return <Computed>
        {function () {
            const availability = creationInput?.get()?.selectedAvailability;
            const price = availability?.priceTotal;
            const currency = availability?.currency;
            const quantity = count?.get();

            if (!availability || !price || !currency || !quantity) {
                return <></>;
            }

            return <HolaStripeProvider
                venue={venueID}
                currency={currency}
                amount={price}
                quantity={quantity}
                onComplete={createMatch}>
                <View style={{ padding: spacing.md, justifyContent: "center", alignItems: "center", gap: spacing.sm, flex: 1 }}>
                    <ScrollView style={{ flex: 1, padding: spacing.lg, borderRadius: spacing.lg, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, marginVertical: spacing.md }}>
                        <EmbeddedCheckout />
                    </ScrollView>
                    <Button variant="secondary" onPress={() => setScreen(`counter`)}>{t('matches.checkout.back')}</Button>
                </View>
            </HolaStripeProvider>;
        }}
    </Computed>
}

const CheckoutScreensContext = createContext({});
export function CheckoutScreens({ screens, defaultScreen }) {
    const currentScreen = useObservable(defaultScreen);

    return <Computed>
        {() => {
            return <CheckoutScreensContext.Provider value={{
                setScreen: currentScreen.set,
            }}>
                {screens[currentScreen.get()!]}
            </CheckoutScreensContext.Provider>;
        }}
    </Computed>;
}