import _ from 'lodash'
import Queue from 'queue-async'
import {Strategy} from 'passport'
import {findOrCreateAccessToken} from '../lib'

// Strategy to find or create a user based on a facebookId and token obtained from the facebook mobile sdk
// Data will look like this:
/*
  accessToken: "EAADZBCoZAENeYBAKWleEKhsOR4ij5eddFRRteZC3XryC9b2aQHwOpUT9FHZB63QNjJmyjGKSNnUINueCsdleDZBDqc9FIhdeeNmIN1mp9Ayd24RSPVYkQk15ewxQS3PlIkGImE0SxzlJ0QkS4DHhkmBYnewZByDtxhhdcSJdBRRpDVZBD2h9jqvJOeJ5Ff0WnEFXGlXmjkDS3nTfa2R193rjzPDbI3efZBwZD",
  accessTokenSource: undefined,
  applicationID: "279321155745254",
  declinedPermissions: [],
  expirationTime: 1469858056033.796,
  lastRefreshTime: 1464745008038.082,
  permissions: ["public_profile", "publish_actions"],
  userID: "10153502264266581",
*/
export default class FacebookMobileStrategy extends Strategy {
  constructor(options={}) {
    super()
    _.merge(this, options)
    if (!this.User) throw new Error('[fl-auth] FacebookMobileStrategy: Missing User from options')
  }

  authenticate(req) {
    const User = this.User

    User.findOne({facebookId: req.body.userID}, (err, existingUser) => {
      if (err) return this.error(err)
      let user = existingUser

      const queue = new Queue(1)

      // Found an existing user for this facebook id. Just update their access token
      if (user) {
        queue.defer(callback => user.save({facebookAccessToken: req.body}, callback))
      }
      // no existing user - create a new one
      else {
        queue.defer(callback => {
          user = new User({facebookId: req.body.userID, facebookAccessToken: req.body})
          user.save(callback)
        })
      }

      queue.await(err => {
        if (err) return this.error(err)

        findOrCreateAccessToken({user_id: user.id}, {expires: true}, (err, token, refreshToken, info) => {
          if (err) return this.error(err)

          req.session.accessToken = {token, expiresDate: info.expiresDate}
          req.session.save(err => {if (err) console.log('Error saving session', err)})
          this.success(_.omit(user.toJSON(), 'password'), {accessToken: token})
        })
      })
    })

  }
}
