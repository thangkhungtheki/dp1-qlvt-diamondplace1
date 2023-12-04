var express = require("express")
var router =  express.Router()
var xulydb = require('../CRUD/xulydb')


router.get('/', async (req, res) => {
    if(req.isAuthenticated()){
        let user = await xulydb.timUser (req.user.username)
        // console.log(user)
        switch (user.role) {
            case "admin":
                res.redirect('/vattutest')
              break;
            case "tp":
                res.render('layoutkythuat/main/dashboard')
              break;
            default:
                res.render('layoutkythuat/user/dashboard')
          }
        
    }else{
        res.redirect('/signin')
    }
    
})


module.exports = router