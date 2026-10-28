const { readSession, response } = require('./_shared');
exports.handler = async event => { const login = readSession(event); return response(200, { authenticated: Boolean(login), login: login || null }); };
