var express = require("express")
var router = express.Router()

router.get('/cvdinhky', authenticated, (req, res) => {
    res.render('admin_house/main/view_cvdinhky')
})

router.get('/themcvdinhky', (req, res) => {
    res.render('admin_house/main/themcongviecdinhky')
})
function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
module.exports = router