var express = require("express")
var router = express.Router()
var xulydb = require('../CRUD/xulydb')
const ycsc = require('../CRUD/xulyyeucau')
const multer = require('../multer-upload/multer')

router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await xulydb.timUser(req.user.username)
    // console.log(user)


    switch (user.role) {
      case "admin":
        res.redirect('/vattutest')
        break;
      case "tp":
        let doc = await ycsc.docyeucautheotrangthai('dangxuly')
        res.render('layoutkythuat/main/dashboard', { data: doc })
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

router.post('/taoyc', multer.upload.single('image'), async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      var fileName = req.file.filename
    } catch (error) {
      var fileName = ''
    }


    //console.log(fileName)
    let doc = {
      mayeucau: req.body.code,
      nguoiyeucau: req.body.nguoiyc,
      ngayyeucau: req.body.ngay,
      bophan: req.body.bophan,
      dienthoai: req.body.dienthoai,
      vitri: req.body.vitri,
      khancap: req.body.option,
      mota: req.body.areamota,
      ttbp: 'dangxuly',
      trangthai: 'choduyet',
      filename: fileName
    }
    console.log(doc)
    let result = await ycsc.taoyc(doc)
    // Lấy thông báo từ req.flash và truyền nó cho template
    if (result == true) {
      req.flash('success', 'Dữ liệu đã được lưu và gửi thành công!');
      res.redirect('/qlkt')
    } else {
      req.flash('success', 'Chưa lưu, cần nhập đầy đủ thông tin vào !');
      res.redirect('/qlkt')
    }


  }
})

router.post('/updatettbp', async (req, res) => {
  //let doc = await ycsc.timyctheoma(req.body.mayeucau)
  let ma = req.body.mayeucau
  console.log(ma)
  await ycsc.updatetttbp(ma, 'duyet')
  res.end()
})

router.post('/deletettbp', async (req, res) => {
  let ma = req.body.mayeucau
  console.log('đã xoá: ' + ma)
  await ycsc.deletettbp(ma)
  res.end()
})

router.get('/xemlichsu', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await xulydb.timUser(req.user.username)
    // console.log(user)


    switch (user.role) {
      case "admin":
        res.redirect('/vattutest')
        break;
      case "tp":
        
        res.render('layoutkythuat/main/viewxemlichsu')
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

module.exports = router