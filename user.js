class User {
    constructor(user_id, ws) {
        this._user_id = user_id;
        this._ws = ws;
    }

    get userId() {
        return this._user_id;
    }

    get websocket() {
        return this._ws;
    }
}

module.exports = User;