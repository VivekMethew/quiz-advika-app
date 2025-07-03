const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const { URLS } = require("../../config");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${URLS.MODE_BACKEND}/api/v1/moderators/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
      scope: ["email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
