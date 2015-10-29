'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = sessionOrToken;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function sessionOrToken(req, res, next) {
  if (req.isAuthenticated()) return next();

  _passport2['default'].authenticate('bearer', { session: false }, function (err, user) {
    if (err) return res.status(500).send({ error: err });
    if (!user) {
      if (req.method === 'get') return res.redirect(302, '/login');
      return res.status(401).send({ error: 'Unauthorized' });
    }

    req.login(user, {}, function (err) {
      if (err) return res.status(500).send({ error: err });
      next();
    });
  })(req, res, next);
}

//todo: refresh token

// module.exports = (server_auth, callback) -> return (req, res, next) ->
//   if !req.isAuthenticated or !req.isAuthenticated()
//     requested_url = req.originalUrl or req.url

//     queue = new Queue(1)

//     if req.session and (req.session.returnTo isnt requested_url)
//       req.session.returnTo = requested_url
//       queue.defer (callback) -> req.session.save callback

//     queue.await (err) ->
//      return callback(req, res) if callback
//      res.redirect(302, '/login')

//   else
//     # check access token expiry
//     (req.logout(); return res.redirect(302, '/login')) unless access_token = req.session?.access_token

//     expires_at = access_token.expires_at
//     if expires_at? and moment().isAfter(expires_at)
//       vidigami = passport._strategy('vidigami')
//       (req.logout(); return res.redirect(302, '/login')) unless vidigami
//       vidigami.refreshToken access_token.refresh_token, (err, access_token) ->
//         (req.logout(); return res.redirect(302, '/login')) if err or not access_token?.id
//         req.session.access_token = access_token
//         req.session.save (err) -> (console.log('Failed to save access token to session during refresh') if err)
//         next()
//     else next()
module.exports = exports['default'];