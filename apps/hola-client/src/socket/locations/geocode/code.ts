import geocoding from '@aashari/nodejs-geocoding';

export default async (socket, userInput, cb) => {
    geocoding
        .encode(userInput)
        .then(list => {
            return list.map(item => {
                return {
                    ...item,
                    formatted_address: item.formatted_address
                }
            })
        })
        .then(cb)
        .catch((error) => console.error(error));
}