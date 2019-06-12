class User {
    constructor(user_id, ws) {
        this._user_id = user_id;
        this._ws = ws;
        this._is_playing = false;
    }

    get userId() {
        return this._user_id;
    }

    get websocket() {
        return this._ws;
    }

    get isPlaying() {
        return this._is_playing
    }

    set isPlaying(isPlaying) {
        this._is_playing = isPlaying
    }

    toJson() {
        var obj = new Object();
        obj.user_id = this.userId;
        obj.is_playing = this.isPlaying;
        return obj;
    }
}

User.prototype.toString = function() {
    return "User[userId=" + this.userId + ",isPlaying=" + this.isPlaying + "]";
}

module.exports = User;