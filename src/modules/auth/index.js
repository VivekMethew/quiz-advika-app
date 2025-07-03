const passport = require("passport");
const { URLS } = require("../../config");

module.exports = {
  googleAuth: (router) => {
    /**
     * @GOOGLE Auth routes
     */

    router.get(
      "/google",
      passport.authenticate("google", ["profile", "email"])
    );

    router.get(
      "/google/callback",
      passport.authenticate("google", {
        successRedirect: URLS.FRONTEND,
        failureRedirect: "/login/failed",
        // failureFlash: true,
      })
    );
  },

  facebookAuth: (router) => {
    router.get(
      "/facebook",
      passport.authenticate("facebook", {
        //scope: ["email", "public_profile", "user_friends"],
        scope: `email, public_profile, user_friends`,
      })
    );

    router.get(
      "/facebook/callback",
      passport.authenticate("facebook", {
        successRedirect: URLS.FRONTEND, // "/api/v1/moderators/facebook/login/success",
        failureRedirect: "/login/failed",
        // failureFlash: true,
      })
    );
  },
};
