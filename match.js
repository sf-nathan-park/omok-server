const uuidv1 = require('uuid/v1');

class Match {
    constructor(challenger, opponent) {
        this._challenger = challenger;
        this._opponent = opponent;
        this._matchId = uuidv1();
    }

    get challenger() {
        return this._challenger;
    }

    get opponent() {
        return this._opponent;
    }

    get matchId() {
        return this._matchId;
    }

    toJson() {
        var obj = new Object();
        obj.match_id = this.matchId;

        if (this.challenger != null) {
          obj.challenger_id = this.challenger.userId;
        } else {
          obj.challenger_id = "";
        }

        if (this.opponent != null) {
          obj.opponent_id = this.opponent.userId;
        } else {
          obj.opponent_id = "";
        }

        return obj;
    }
}

Match.prototype.toString = function() {
    return "Match[challenger=" + this.challenger + ",opponent=" + this.opponent + "]";
}

module.exports = Match;