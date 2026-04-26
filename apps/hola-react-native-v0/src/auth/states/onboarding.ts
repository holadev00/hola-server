import { observable, observe } from "@legendapp/state";

type OnboardingState = {
    screen: 'SignUp' | 'Language' | 'Preferences' | 'Confidentiality' | 'Tutorial';
    user: {
        avatar: any;
        displayname: string;
        username: string;
        email: string;
        phone: string;
        password: string;
        password_confirm: string;
    },
    lang: string;
    preferences: {
        level: string;
        position: string;
    };
    private: boolean;
}

export const onboarding$ = observable<OnboardingState>({});

observe(onboarding$, ({ value }) => (value?.user) && console.log(JSON.stringify(value, null, 2)));