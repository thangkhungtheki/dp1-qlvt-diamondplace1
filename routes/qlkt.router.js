var express = require("express")
var router = express.Router()
var xulydb = require('../CRUD/xulydb')
const ycsc = require('../CRUD/xulyyeucau')
const filemulter = require('../multer-upload/multer')


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



router.post('/taoyc', filemulter.upload.array('image', 3), filemulter.handleError, async (req, res) => {
  if (req.isAuthenticated()) {
    
    // if (req.files.length > 3) {
    //   console.log('hơn 4 file')
    //   req.flash('success', 'Vượt số lượng file, tối đa 3 file ảnh ');
    //   res.redirect('/qlkt')
    // } else {
      try {
        var fileName = req.files
        var ma = req.body.code
      //console.log(fileName)
      let doc = {
        mayeucau: ma.replace(/\+/g, ' '),
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
      //console.log(doc)
      let result = await ycsc.taoyc(doc)
      // Lấy thông báo từ req.flash và truyền nó cho template
      if (result == true) {
        req.flash('success', 'Dữ liệu đã được lưu và gửi thành công!');
        res.redirect('/qlkt')
      } else {
        req.flash('success', 'Chưa lưu, cần nhập đầy đủ thông tin vào !');
        res.redirect('/qlkt')
      }
        // console.log(fileName)
      } catch (error) {
        res.send('Lôi Không xác định ')
      }
      
    // }
  }else{
    res.redirect('/signin')
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
        let doc = await ycsc.docyeucautheotrangthai('duyet')
        res.render('layoutkythuat/main/viewxemlichsu', { data: doc })
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

router.get('/viewyeucau', async (req, res) => {
  let user = await xulydb.timUser(req.user.username)
  const successMessage = req.flash('success')[0];
  res.render('layoutkythuat/main/view_guiyc', { data: user, successMessage })
})

router.get('/info', async (req, res) => {
  let mayeucau = req.query.mayeucau;
  console.log(mayeucau)
  let doc = await ycsc.timyctheoma(mayeucau)
  //console.log(doc)
  let datafile = doc[0].filename
  //console.log(datafile)
  if (doc) {
    res.render('layoutkythuat/main/view_info', { data: doc })
  }
})

module.exports = router