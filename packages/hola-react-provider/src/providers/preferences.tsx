import { Computed } from "@legendapp/state/react";
import { createContext, useContext } from "react";

const preferencesContext = createContext({});

export const usePreferences = () => useContext(preferencesContext);

export function PreferencesProvider({ children }) {
    return <Computed>{function () {
        return <preferencesContext.Provider value={{
            locale: "fr-FR",
            currency: "EUR"
        }}>
            {children}
        </preferencesContext.Provider>;
    }}</Computed>;
}