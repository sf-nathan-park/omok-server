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
    console.log('Received Message : ' + message);
    var command = new Command(message.toString());
    var I = getUserByConnection(ws);
    switch(command.command) {
      case "LOGI":
        var userId = JSON.parse(command.payload).user_id;
        var errorCode = 0;

        for (var i in users) {
          if (users[i].userId === userId || users[i].websocket === ws) {
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
          let index = matches.indexOf(match);
          if (index > -1) {
            matches.splice(index, 1);
          }
        }

        var data = "ACCEPT_MATCH " + command.payload;
        match.challenger.websocket.send(data);
        break;
      case "TURN":
        var matchId = JSON.parse(command.payload).match_id;
        var match = getMatchById(matchId);

        if (match != null) {
          var receiver = match.challenger === I ? match.opponent : match.challenger;
          var data = command.command + " " + command.payload;
          receiver.websocket.send(data);
        }

        break;
      case "END_MATCH":
        var matchId = JSON.parse(command.payload).match_id;
        var match = getMatchById(matchId);
        
        if (match != null) {
          var receiver = match.challenger === I ? match.opponent : match.challenger;

          if (receiver != null) {
            var data = command.command + " " + command.payload;
            receiver.websocket.send(data);
          }

          match.challenger.isPlaying = false;
          match.opponent.isPlaying = false;

          let index = matches.indexOf(match);
          if (index > -1) {
            matches.splice(index, 1);
          }
        }

        break;
      case "SURRENDER":
        var matchId = JSON.parse(command.payload).match_id;
        var match = getMatchById(matchId);
        
        if (match != null) {
          var receiver = match.challenger === I ? match.opponent : match.challenger;
          if (receiver != null) {
            var data = command.command + " " + command.payload;
            receiver.websocket.send(data);
          }
        }

        break;
      case "DEBUG":
        console.log("### DEBUG");
        console.log("users = " + users);
        console.log("matches = " + matches);
        break;
    }
  });

  ws.on('close', function() {
    var user = getUserByConnection(ws);
    console.log("[CLOSE] user = " + user);
    if (user == null) {
      return;
    }

    if (user.isPlaying) {
      var match = getMatchByUserId(user.userId);
      if (match != null) {
        var receiver = match.challenger === user ? match.opponent : match.challenger;
        if (receiver != null) {
          var data = "DISCONNECT {}";
          receiver.websocket.send(data);
        }
      }
    }

    let index = users.indexOf(user);
    if (index > -1) {
      users.splice(index, 1);
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

function getMatchByUserId(userId) {
  for (var i in matches) {
    if (matches[i].challenger.userId === userId || matches[i].opponent.userId === userId) {
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