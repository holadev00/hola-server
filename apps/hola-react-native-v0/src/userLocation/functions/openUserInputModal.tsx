import userInputStore from "../state/userInputStore";

export function openUserInputModal(): Promise<string | null> {
    userInputStore.open.set(true);

    return new Promise((resolve) => {
        userInputStore.submit.on(() => {
            const address = userInputStore.search.address.get();
            resolve(address);
        });

        userInputStore.dismiss.on(() => {
            userInputStore.open.set(false);
            resolve(null);
        });
    });
}
