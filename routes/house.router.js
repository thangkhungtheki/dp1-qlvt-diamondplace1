var express = require("express")
var router = express.Router()
var xulyhouse = require('../CRUD/xuly_house')
var moment = require('moment')

router.get('/cvdinhky', authenticated, (req, res) => {
    res.render('admin_house/main/view_cvdinhky')
})

router.get('/themcvdinhky', (req, res) => {
    res.render('admin_house/main/themcongviecdinhky')
})

router.post('/themhouse', async(req, res) => {
  let  originalDate = moment(req.body.ngaybatdau)
  let ngayformat = originalDate.format('YYYY-MM-DD')
  //console.log(ngayformat)
  let doc = {
    tencv: req.body.tencv,
    vitricv: req.body.vitricv,
    ngaybatdau: ngayformat,
    timehethan: req.body.timehethan,
    ngayketthuc: req.body.ngaykethuc,
    ngayguimail: req.body.ngayguimail,
    ghichu: req.body.ghichu,
    songayhethan: '1'
  }
  const result = await xulyhouse.them(doc)
  if(result){
    // res.send('<script> alert("Thêm thành công !!!") ; window.location.href = "/house/themcvdinhky" </script>')
    res.redirect('/house/themcvdinhky')
  }else{
    res.send('có lôĩ không thêm được')
  }
})

function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

function tinhngayketthuc (ngaybatdau, stepday){

}
module.exports = router