import { Server } from 'socket.io';
import {scrapper} from "../../utils/scrapper";

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running')
    } else {
        console.log('Socket is initializing')
        const io = new Server(res.socket.server)
        res.socket.server.io = io

        io.on('connection', socket => {
            socket.on('new-postura', postura => {
                socket.broadcast.emit('update-posturas', postura);
            });

            socket.on('get-mid-price-market', async () => {
                const { price } = await scrapper();
                socket.emit('set-mid-price-market', price);
            })
        });
    }
    res.end();
}

export default SocketHandler
