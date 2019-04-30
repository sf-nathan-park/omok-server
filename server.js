'use strict';

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 5000 });

console.log('process.env.PORT = ' + process.env.PORT);

wss.on('connection', function connection(ws, request) {
  console.log("connected. " + request.connection.remoteAddress);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
  });
});