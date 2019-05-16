'use strict';

const WebSocket = require('ws');
const User = require('./user');
const Command = require('./command');
const Match = require('./match');

const wss = new WebSocket.Server({ port: process.env.PORT || 5000 });

console.log('process.env.PORT = ' + process.env.PORT);

var users = [];
var matches = [];

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

        console.log("[LOGI] userId = " + userId + ", error_code = " + errorCode);

        if (errorCode == 0) {
          users.push(new User(userId, ws));
        }

        sendLogi(errorCode, ws);
        break;
      case "USER_LIST":
        sendUserList(ws);
        break;
      case "START_MATCH":
        var opponentUserId = JSON.parse(command.payload).opponent_user_id;
        var I = getUserByConnection(ws);
        var opponent = getUserById(opponentUserId);

        console.log("[START_MATCH] opponentUserId = " + opponentUserId + ", I = " + I + ", opponent = " + opponent);

        if (I == null) {
          return;
        }

        if (opponent == null) {
          // TODO
        } else {
          var match = new Match(I, opponent);
          matches.push(match);
          sendStartMatch(match);
        }

        break;

      case "ACCEPT_MATCH":
        var matchId = JSON.parse(command.payload).match_id;
        var isAccept = JSON.parse(command.payload).is_accept;
        var match = getMatchById(matchId);

        console.log("[ACCEPT_MATCH] matchId = " + matchId + ", isAccept = " + isAccept + ", match = " + match);

        if (match == null) {
          return;
        }

        if (isAccept === true) {
          match.challenger.isPlaying = true;
          match.opponent.isPlaying = true;
        } else {
          matches.remove(match);
        }

        var data = "ACCEPT_MATCH " + command.payload;
        match.challenger.websocket.send(data);
        break;
    }

    // console.log('received: %s', message);
    // wss.clients.forEach(function each(client) {
    //     if (client !== ws && client.readyState === WebSocket.OPEN) {
    //         client.send(message);
    //     }
    // });
  });

  ws.on('close', function() {
    var user = getUserByConnection(ws);
    if (user == null) {
      return;
    }
  })
});

function getUserByConnection(ws) {
  for (var i in users) {
    if (users[i].websocket === ws) {
      return users[i];
    }
  }

  return null;
}

function getUserById(userId) {
  for (var i in users) {
    if (users[i].userId === userId) {
      return users[i];
    }
  }

  return null;
}

function getMatchById(matchId) {
  for (var i in matches) {
    if (matches[i].matchId === matchId) {
      return matches[i];
    }
  }

  return null;
}

function sendLogi(errorCode, ws) {
  if (!ws instanceof WebSocket) {
    return;
  }

  var obj = new Object();
  obj.error_code = errorCode;
  var data = "LOGI " + JSON.stringify(obj);
  ws.send(data);
}

function sendUserList(ws) {
  if (!ws instanceof WebSocket) {
    return;
  }

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

function sendStartMatch(match) {
  if (!match instanceof Match) {
    return;
  }

  var obj = new Object();
  obj.match_id = match.matchId;
  obj.user_id = match.challenger.userId;

  var data = "START_MATCH " + JSON.stringify(obj);
  match.opponent.websocket.send(data);
}