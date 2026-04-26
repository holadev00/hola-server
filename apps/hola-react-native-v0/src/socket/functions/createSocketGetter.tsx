import type { Socket } from 'socket.io-client';

type SocketGetterParams<T = any> = {
    socket: Socket;
    event: string;
    args?: any[];
    setter: (data: T) => void;
};

export function createSocketGetter({
    socket,
    event,
    args = [],
    setter,
}: SocketGetterParams) {
    if (!socket || !setter) return () => {};

    const emit = () => {
        socket.emit(event, ...args, setter);
    };

    emit();
    socket.on('connect', emit);

    return () => {
        socket.off('connect', emit);
    };
}