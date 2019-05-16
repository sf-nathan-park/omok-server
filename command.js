class Command {
    constructor(message) {
        if (typeof message === 'string') {
            var splittedMessages = message.split(' ');
            if (splittedMessages.length != 2) {
                this._command = "";
                this._payload = "";
            } else {
                this._command = splittedMessages[0];
                this._payload = splittedMessages[1];
            }
            
        } else {
            this._command = "";
            this._payload = "";
        }
    }

    get command() {
        return this._command;
    }

    get payload() {
        return this._payload;
    }
}

Command.prototype.toString = function() {
    return "Command[command=" + this.command + ",payload=" + this.payload + "]";
}

module.exports = Command;