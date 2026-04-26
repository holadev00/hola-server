export function venuePath(path: string) {
    return {
        path,
        parse: {
            venue: (venue) => venue.replace(/^@/, ''),
        },
        stringify: {
            venue: (venue) => `@${venue}`,
        },
    };
}
