// In-memory repository as a placeholder for a database
class SessionRepository {
    constructor() {
        this.sessions = new Map();
    }

    createSession(wsId) {
        const sessionId = `sess_${Math.random().toString(36).substring(7)}`;
        this.sessions.set(wsId, sessionId);
        return sessionId;
    }

    getSession(wsId) {
        return this.sessions.get(wsId);
    }

    deleteSession(wsId) {
        this.sessions.delete(wsId);
    }
}

module.exports = new SessionRepository();
