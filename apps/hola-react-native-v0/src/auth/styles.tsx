import { StyleSheet } from "react-native";

// -- Styles --

export const styles = StyleSheet.create({
    // Structure générale
    screenContainer: {
        flex: 1,
        backgroundColor: "white",
    },
    screenContent: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: "space-between",
    },

    // Contenu principal
    mainContentContainer: {
        height: "50%",
        alignItems: "stretch",
        justifyContent: "space-between",
        gap: 32,
    },
    mainBody: {
        gap: 32,
    },

    // Header “Welcome to HOLA”
    headerContainer: {
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    headerSubtitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
    },

    // Boutons d'authentification
    authOptionsContainer: {
        gap: 8,
    },
    actionButton: {
        padding: 12,
        alignItems: "center",
        borderRadius: 12,
        userSelect: "none",
    },
    actionButtonText: {
        fontWeight: "bold",
    },

    // Sélecteurs et liens
    languageSelectorContainer: {
        justifyContent: "center",
        alignItems: "flex-end",
    },
    loginRedirectContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 16,
    },
    loginRedirectText: {
        color: "#888",
        textDecorationStyle: "solid",
        textDecorationLine: "underline",
    },

    // Inputs
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#f8f8f8",
    }
});
