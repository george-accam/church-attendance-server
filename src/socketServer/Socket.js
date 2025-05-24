import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, { cors: { origin: "*",} });

    io.on("connection", (client) => {
        console.log(`Client connected`);

        // Handle disconnection
        client.on("disconnect", () => {
            console.log(`Client disconnected`);
        });
    });
};

export const getSocket = () => {
    if (!io) {
        console.log('Socket.io not initialized. Call initSocket first.');
    }

    return io;
}
