var express = require("express")
var router = express.Router()
var xulyhouse = require('../CRUD/xuly_house')
var moment = require('moment')
var sendmail = require('../sendmail/house.sendmail')


router.get('/cvdinhky', authenticated, (req, res) => {
    res.render('admin_house/main/view_cvdinhky')
})

router.get('/themcvdinhky', (req, res) => {

    res.render('admin_house/main/themcongviecdinhky')
})

router.get('/xemcongviecdinhky', async (req, res) => {
  const docs = await xulyhouse.tim()
  res.render('admin_house/main/view_cvdinhky',{data: docs})
})

router
.get('/suacongviecdinhky', async (req, res)=> {
  const id = req.query.id
  //console.log(id)
  const doc = await xulyhouse.timid(id)
  if(doc){
    // doc[0].ngaybatdau = moment(doc[0].ngaybatdau).format('YYYY-MM-DD')
    // doc[0].ngayketthuc = moment(doc[0].ngayketthuc).format('YYYY-MM-DD')
  
    res.render('admin_house/main/sua_cvdinhky',{data: doc })
  }
})
.post('/suacongviecdinhky', async(req, res)=> {
  let originalDate = moment(req.body.ngaybatdau)
  let ngayformat = originalDate.format('YYYY-MM-DD')
  let originNgayketthuc = moment(req.body.ngayketthuc)
  let ngayketthucFormat = originNgayketthuc.format('YYYY-MM-DD')
  //console.log(ngayformat)
  let id = req.body.iddinhky
  let doc = {
    tencv: req.body.tencv,
    vitricv: req.body.vitricv,
    ngaybatdau: ngayformat,
    timehethan: req.body.timehethan,
    ngayketthuc: ngayketthucFormat,
    ngayguimail: req.body.ngayguimail,
    ghichu: req.body.ghichu,
    laplai: req.body.name_checkbox || "no",
    hoanthanh: req.body.hoanthanh
  }
  //console.log(doc)
  const result = await xulyhouse.sua(id, doc)
  if(result){
    res.redirect('/house/xemcongviecdinhky')
  }else{
    return res.send('Lỗi không update được >>> check lại hệ thống')
  }
})

router.post('/hoanthanhcv', async(req, res)=>{
  let id = req.body.id
  let result = await xulyhouse.updatehoanthanh(id,'yes')
  if(result){
    return res.send('Thành công')
  }else{
    return res.send('Lỗi Hệ Thống vui lòng thử lại sau !!! Xin cảm ơn')
  }
})

router.post('/themhouse', async(req, res) => {
  let  originalDate = moment(req.body.ngaybatdau)
  let ngayformat = originalDate.format('YYYY-MM-DD')
  let originNgayketthuc = moment(req.body.ngayketthuc)
  let ngayketthucFormat = originNgayketthuc.format('YYYY-MM-DD')
  //console.log(ngayketthucFormat)
  //console.log(ngayformat)
  let doc = {
    tencv: req.body.tencv,
    vitricv: req.body.vitricv,
    ngaybatdau: ngayformat,
    timehethan: req.body.timehethan,
    ngayketthuc: ngayketthucFormat,
    ngayguimail: req.body.ngayguimail,
    ghichu: req.body.ghichu,
    laplai: req.body.name_checkbox || "no"
  }
  const result = await xulyhouse.them(doc)
  if(result){
    // return res.send('<script> alert("Thêm thành công !!!") ; window.location.href = "/house/themcvdinhky" </script>')
    res.redirect('/house/themcvdinhky')
  }else{
    return res.send('có lôĩ không thêm được')
  }
})

router.post('/delcvdinhky', async(req, res) => {
  let id = req.body.id
  // console.log(id)
  const result = await xulyhouse.xoa(id)
  if(result){
    res.redirect('/house/xemcongviecdinhky')
  }else{
    return res.send('có lỗi không xoá >>> tải lại trang')
  }
})

router.get('/cronjobsendmail', async(req, res) => {
  const docs = await xulyhouse.tim()
  const newdata = await tinhngayconlai(docs)
  sendmail.sendmail(newdata)
  return res.status(200).send('ok');
})

function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

async function tinhngayconlai(data){
    var newdata = []
    
    // data.forEach(element => {
    //     const daynow = moment().format('YYYY-MM-DD')
    //     const songay = moment(element.ngayhethan).diff(daynow, 'days');
    //     console.log('Data số ngày: ',songay)
    //     element['soooooooo'] = 'ccacccaaaccacaccac'
    //     newdata.push(element)
    //     console.log(element)
    // });

    // const newArray = await data.map((e,i)=>{
    //     const daynow = moment().format('YYYY-MM-DD')
    //     const songay = moment(e.ngayhethan).diff(daynow, 'days');
    //     console.log('Data số ngày: ',songay)
    //     const update_e = {...e, ['songayconlai']: songay, i }
    //     return update_e
    // })
    var daynow = moment().format('YYYY-MM-DD');
    for (let i = 0; i < data.length; i++) {
        
        let songay = moment(data[i].ngayketthuc).diff(daynow, 'days');
        //console.log('Data số ngày: ',songay);
        data[i].songayhethan = songay
        newdata.push(data[i])
       }

    return newdata
}

module.exports = router