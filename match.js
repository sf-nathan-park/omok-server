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
}

module.exports = Match;