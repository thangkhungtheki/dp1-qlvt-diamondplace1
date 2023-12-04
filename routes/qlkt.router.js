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
            case "nv":
                res.render('layoutkythuat/user/dashboard')
              break;
            default:
                res.send('bạn đã Đăng ký thành công!!! <br\> Chào bạn: <b>' + user.username + ' </b>, vui lòng liên hệ admin và báo tên user, để được cấp quyền')
          }
        
    }else{
        res.redirect('/signin')
    }
    
})


module.exports = router