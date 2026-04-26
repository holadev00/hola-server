import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export function useSocket(namespace = "/") {
    const managerRef = useContext(SocketContext);
    return managerRef?.current?.socket(namespace);
}
