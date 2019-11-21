"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const request_1 = tslib_1.__importDefault(require("request"));
const util_1 = require("util");
const [getAsync] = [request_1.default.get].map(util_1.promisify);
function silentLoginHandler(settings, sessionStore) {
    return (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!req) {
            throw new Error('Request is not available');
        }
        if (!res) {
            throw new Error('Response is not available');
        }
        // should probably change this to body
        const accessToken = req.query.access_token;
        if (!accessToken) {
            throw new Error('The access token is required');
        }
        const existingSession = yield sessionStore.read(req);
        if (existingSession) {
            // Do nothing, already have a cookie to use
            res.end();
            return;
        }
        const { body: user } = yield getAsync({
            baseUrl: `https://${settings.domain}`,
            url: 'userinfo',
            json: true,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if (!user || !Object.keys(user).length) {
            throw new Error('The user could not be retrieved with the provided access token');
        }
        // Create the session.
        const session = {
            // user: {
            //   ...claims
            // },
            user,
            // idToken: tokenSet.id_token,
            accessToken,
            // refreshToken: tokenSet.refresh_token,
            createdAt: Date.now()
        };
        // Create the session.
        yield sessionStore.save(req, res, session);
        res.end();
    });
}
exports.default = silentLoginHandler;
//# sourceMappingURL=silent-login.js.map