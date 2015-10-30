import moment from 'moment'
import Backbone from 'backbone'
import bcrypt from 'bcrypt-nodejs'
import crypto from 'crypto'

const db_url = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!db_url) console.log('Missing process.env.DATABASE_URL')

export default class User extends Backbone.Model {
  url = `${db_url}/users`
  schema = () => ({
    access_tokens: () => ['hasMany', require('./access_token')],
  })

  static createHash(password) { return bcrypt.hashSync(password) }

  static createResetToken(callback) {
    crypto.randomBytes(20, (err, buf) => {
      if (err) return callback(err)
      callback(null, buf.toString('hex'))
    })
  }

  defaults() { return {created_at: moment.utc().toDate()} }

  passwordIsValid(password) { return bcrypt.compareSync(password, this.get('password')) }

}

User.prototype.sync = require('backbone-mongo').sync(User)
