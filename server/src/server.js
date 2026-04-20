const http = require('http');
const WebSocket = require('ws');
const app = require('./app');
const chatController = require('./controllers/chat.controller');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket Connection Handling
wss.on('connection', (ws, req) => {
    chatController.handleConnection(ws, req);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Structured WebSocket Server is listening on port ${PORT}`);
});
