var WebSocket = require('ws');
var readline = require('readline')

var r = readline.createInterface({
    input:process.stdin,
    output:process.stdout
})
r.setPrompt('> ');
r.on('line', function(line){
    if (line == 'exit') {
        r.close();
    }

    client.send(line);
    r.prompt()
});

r.on('close', function(){
    process.exit();
});

// var client = new WebSocket('ws://sendbird-omok.herokuapp.com/');
var client = new WebSocket('ws://localhost:5000/');
client.on('open', function() {
    console.log("open");
    r.prompt();
});

client.on('message', function incoming(message) {
    console.log(message);
});

client.on('ping', function() {
    console.log("ping");
});

client.on('error', function(err) {
    console.error("error " + err);
});

client.on('close', function() {
    console.log("clear");
    process.exit();
});

