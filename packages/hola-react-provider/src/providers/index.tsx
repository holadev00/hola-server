//import { AuthProvider } from "./auth";
//import { ManagerProvider } from "./manager";

import { PreferencesProvider } from "./preferences";

export const HolaProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <PreferencesProvider>
            {children}
        </PreferencesProvider>
    );
};