'use strict';

const WebSocket = require('ws');
const User = require('./user');
const Command = require('./command');

const wss = new WebSocket.Server({ port: process.env.PORT || 5000 });

console.log('process.env.PORT = ' + process.env.PORT);

var users = [];

wss.on('connection', function connection(ws, request) {
  ws.on('message', function incoming(message) {
    var command = new Command(message.toString());
    switch(command.command) {
      case "LOGI":
        var userId = JSON.parse(command.payload).user_id;
        var errorCode = 0;

        for (var i in users) {
          if (users[i].userId === userId) {
            errorCode = 1;
            break;
          }
        }

        if (errorCode == 0) {
          users.push(new User(userId, ws));
        }

        sendLogi(errorCode, ws);
        break;
      case "USER_LIST":
        sendUserList(ws);
        break;
    }

    // console.log('received: %s', message);
    // wss.clients.forEach(function each(client) {
    //     if (client !== ws && client.readyState === WebSocket.OPEN) {
    //         client.send(message);
    //     }
    // });
  });
});

function sendLogi(errorCode, ws) {
  var obj = new Object();
  obj.error_code = errorCode;
  var data = "LOGI " + JSON.stringify(obj);
  ws.send(data);
}

function sendUserList(ws) {
  var arr = new Array();
  for (var i in users) {
    var user = users[i];
    var obj = new Object();
    obj.user_id = user.userId;
    obj.is_playing = user.isPlaying;
    arr.push(obj);
  }
  var data = "USER_LIST " + JSON.stringify(arr);
  ws.send(data);
}