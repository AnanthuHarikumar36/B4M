const userHelpers = require("../helpers/user-helpers");

module.exports = {
  isLoggedin(req, res, next) {
    if (req.session.loggedin) {
      res.redirect("/");
    } else {
      next();
    }
  },
  async isUser(req, res, next) {
    if (req.session.loggedin) {
      let user = await userHelpers.getOneUser(req.session.user._id);
      if(user.status){
        next()
      }else{
        req.session.user=null
        req.session.loggedin=false
        res.redirect("/");

      }
    } else {
      res.redirect("/");
    }
  },
  isloggedInad(req, res, next) {
    if (req.session.isloggedInad) {
      res.admin = req.session.admin;
      next();
    } else {
      console.log("admin session");
      res.render("../views/admin/admin-login");
    }
  },
};
