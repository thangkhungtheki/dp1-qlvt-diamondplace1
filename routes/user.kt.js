var express = require("express")
var router = express.Router()

const ycsc = require('../CRUD/xulyyeucau')


var uridatabase = process.env.DATABASE_URL

function authenticated(req, res, next) {
if (req.isAuthenticated()) {
return next();
}
res.redirect('/login');
}

router.get('/', authenticated, async(req, res) => {
let bp = req.user.bp
//console.log(bp)
let doc = await ycsc.timtatca_yctheobophan(bp)
res.render("layoutkythuat/user/view_xemlichsu_user",{data: doc ? doc : [] ,_username:''})
})

router.get('/userinfo', async(req, res) => {
let mayeucau = req.query.mayeucau
//console.log(mayeucau)
let doc = await ycsc.timyctheoma(mayeucau)
//console.log(doc)
//let datafile = doc[0].filename
//console.log(datafile)
if (doc) {
// res.render('docformtoejs/usr_bmphieuyeucau', { data: doc, user: user, myPathENV: process.env.myPathENV })
res.render('docformtoejs/usr_bmphieuyeucau', { data: doc })
}
})

module.exports = router