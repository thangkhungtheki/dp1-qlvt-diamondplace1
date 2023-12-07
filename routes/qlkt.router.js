var express = require("express")
var router = express.Router()
var xulydb = require('../CRUD/xulydb')
const ycsc = require('../CRUD/xulyyeucau')
var mess = ""

router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await xulydb.timUser(req.user.username)
    // console.log(user)


    switch (user.role) {
      case "admin":
        res.redirect('/vattutest')
        break;
      case "tp":
        res.render('layoutkythuat/main/dashboard')
        break;
      case "nv":
        const successMessage = req.flash('success')[0];
        res.render('layoutkythuat/user/dashboard', { data: user, successMessage })
        break;
      default:
        res.send('bạn đã Đăng ký thành công!!! <br\> Chào bạn: <b>' + user.username + ' </b>, vui lòng liên hệ admin và báo tên user, để được cấp quyền')
    }



  } else {
    res.redirect('/signin')
  }

})

router.post('/taoyc', async (req, res) => {
  if (req.isAuthenticated()) {
    let doc = {
      nguoiyeucau: req.body.nguoiyc,
      ngayyeucau: req.body.ngay,
      bophan: req.body.bophan,
      dienthoai: req.body.dienthoai,
      vitri: req.body.vitri,
      khancap: req.body.option,
      mota: req.body.areamota,
      trangthai: 'chờ duyệt',

    }
    await ycsc.taoyc(doc)
    // Lấy thông báo từ req.flash và truyền nó cho template

    req.flash('success', 'Dữ liệu đã được lưu thành công!');
    res.redirect('/qlkt')

  }
})


module.exports = router