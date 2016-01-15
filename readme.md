# Auth package for FounderLab apps

Changes: 

- 0.3.2: Register / login responses include all fields on the user model except password
- 0.3.1: internalAuth can look up specific users now. It accepts a User argument. If provided and `req.query.$user_id` is present on a request that user will be looked up. `req.user` will then be set to this user instance instead of the dummy user.
- 0.3.0: Email confirmation is sent on registration. Configure the email sending via the sendConfirmationEmail option
- 0.2.0: Extra params for registration can be configured. Authorised middleware delegates more to the canAccess option

Usage (server):

    import {configure as configureAuth, loggedIn} from 'fl-auth-server'

    app = express()                       // Provide your express app
    configureAuth({
      app,

      User: require('./models/user'),     // Give fl-auth-server another User model to use if you have a custom one

      middleware: {
        initialize: true,                 // enable passport middleware 
        session: true,                    // (don't change these)
      },

      paths: {
        login: '/login',                  // Route to log someone in
        register: '/register',            // Route to register a new user
        logout: '/logout',                // Route to log someone out
        reset_request: '/reset_request',  // Route to request a password reset email be sent
                                          // must provide `email` as a param in the body, e.g. {email: 'a@example.com'} 
        reset: '/reset',                  // Route that a user will visit to perform their password reset. 
                                          // Requires `reset_token` as a param. This token is generated by the reset_request 
                                          // and should be passed through via the email you sent them from their reset_request.
        success: '/',                     // Go here when a user logs in or registers 
                                          // (if there's no other location specified) <- This isn't implemented yet
      },

      facebook: {                         // facebook login info
        url: process.env.URL,
        paths: {
          redirect: '/auth/facebook',
          callback: '/auth/facebook/callback',
        },
        scope: ['email'],
        profile_fields: ['id', 'displayName', 'email'],
      },
      
      login: {                          
        username_field: 'email',                                // The login/register strategies look for these properties on the request body
        password_field: 'password',                             //
        bad_request_message: 'Missing credentials',             // If username or password is missing this is sent
        reset_token_expires_ms: 1000 * 60 * 60 * 24 * 7,        // Reset tokens expire in 7 days by default
        extra_register_params: ['type'],                        // Extra fields to be plucked from the body of a POST to /register that will be saved on the user model. Fields not in this whitelist (other than username_field/password_field) are ignored
      },

      // You need to override this with a function that sends this user an email with a link to the reset page, 
      // with a query param containing this reset_token 
      // e.g. <a href="https://example.com/reset?reset_token=${user.get('reset_token')}>Reset your password here</a>
      sendResetEmail: (user, callback) => {
        console.log('[fl-auth] sendResetEmail not configured. No password reset email will be sent. Reset token:', user.get('email'), user.get('reset_token'))
        callback()
      },

      sendConfirmationEmail: (user, callback) => {
        // same deal with this. Send an email with a link to confirm the email
        // e.g.
        const email = user.get('email')
        const query = querystring.stringify({email, token: user.get('email_confirmation_token')})
        const message = `${app_config.url}/confirm_email?${query}`
        console.log('Sending email_confirmation_token email', email, user.get('email_confirmation_token'), message)
        sendMail({to: email, subject: `Confirm your email for ${app_config.url}`, text: message}, callback)
      }

    })
