export const emitWhoAmI = (currentUser, target) => {
    const payload = {
        initialized: true,
        isLoggedIn: !!currentUser,
    };

    if (typeof target === "function") {
        target(payload); // ACK
    }
};
