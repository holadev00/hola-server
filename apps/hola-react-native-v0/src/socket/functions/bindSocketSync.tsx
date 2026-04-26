type SocketLike = {
    on: (event: string, cb: (...args: any[]) => void) => void;
    off: (event: string, cb?: (...args: any[]) => void) => void;
    emit: (event: string, ...args: any[]) => void;
    connected?: boolean;
};

type BindSocketSyncOptions = {
    listen: string;
    emit?: string;
    payload?: (...args: any[]) => any;
    onMessage: (...args: any[]) => void;
};

export function bindSocketSync(
    socket: SocketLike,
    {
        listen, emit = listen, payload, onMessage,
    }: BindSocketSyncOptions
) {
    const handleConnect = () => {
        socket?.emit(emit, payload ? payload : undefined);
    };

    const handleDisconnect = () => {
        socket?.off(listen, onMessage);
    };

    socket?.on(listen, onMessage);
    socket?.on("connect", handleConnect);
    //socket?.on("disconnect", handleDisconnect);

    if (socket?.connected) {
        handleConnect();
    }

    return () => {
        socket?.off(listen, onMessage);
        socket?.off("connect", handleConnect);
        //socket.off("disconnect", handleDisconnect);
    };
}
