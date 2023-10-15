import { useContext, createContext, useState, useEffect } from 'react';
import io from "socket.io-client";

const Context = createContext();
export const useConnection = () => useContext(Context);

export const Provider = ({ children }) => {

    const [connection, setConnection] = useState(null);
    
    
    const data = {
        connection,
    };

    useEffect(() => {
        fetch("/api/socket");

        const socket = io();
        socket.connect();

        socket.on('connect', () => {
            setConnection(socket);
        });
        

        return () => {
            socket.off('connect');
        };
    }, []);

    return (
        <Context.Provider value={{ ...data }}>
            {children}
        </Context.Provider>
    );
};

export default Context;
