import { getMatches } from "./getMatches";

export default async function getMatchesDetails(socket, match, cb) {
    try {
        if (!cb) return;
    
        const clientId = socket?.session?.client;
        const userId = socket?.session?.currentUser?.get();
        
        const [ details ] = await getMatches({ match, clientId, userId });
    
        cb(details);
    } catch (error) {
        console.error(error);  
    }
}