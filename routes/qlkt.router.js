var express = require("express")
var router = express.Router()
var xulydb = require('../CRUD/xulydb')
const ycsc = require('../CRUD/xulyyeucau')
const filemulter = require('../multer-upload/multer')
const toolmongo = require('../tool_mongo/backup')

var uridatabase =  process.env.DATABASE_URL


// Middleware để thiết lập dữ liệu trong res.locals
router.use(async(req, res, next) => {
  let total = await tongsuachuaton()
  res.locals.arrayTong = total
  next();
});

router.get('/backupdatabase', async (req, res) => {
  await toolmongo.backupMongo(uridatabase,()=>{
    
  })
  res.send('ok done')
})

router.get('/rootyeucau',ruleroot, async(req, res) => {
  let user = await xulydb.timUser(req.user.username)
  const successMessage = req.flash('success')[0];
  res.render('rootadmin/main-yeucau',{data: user,user: req.user, successMessage})
})

router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await xulydb.timUser(req.user.username)
    // console.log(user)


    switch (user.role) {
      
      case "root":
        res.redirect('/qlkt/bieudotron')
        break;
      case "admin":
        res.redirect('/qlkt/bieudotron')
        break;
      case "tp":
        let doc = await ycsc.docyeucautheotrangthai('dangxuly', user.bp)
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



router.post('/taoyc', filemulter.upload.array('image', 4), filemulter.handleError, async (req, res) => {
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
        res.send('Lỗi không xác định ')
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

router.post('/deletephongkythuat', ruleAdmin, async (req, res) => {
  let ma = req.body.mayeucau
  console.log('đã xoá: ' + ma)
  await ycsc._deletephongkythuat(ma)
  
  res.send(true)
})

router.get('/xemlichsu', authenticated, async (req, res) => {
 
    let user = await xulydb.timUser(req.user.username)
    // console.log(user)
    switch (user.role) {
      case "admin":
        res.redirect('/vattutest')
        break;
      case "tp":
        let doc = await ycsc.docyeucautheotrangthai('duyet', user.bp)
        res.render('layoutkythuat/main/viewxemlichsu', { data: doc })
        break;
      case "nv":
        const successMessage = req.flash('success')[0];
        res.render('layoutkythuat/user/dashboard', { data: user, successMessage })
        break;
      default:
        res.send('bạn đã Đăng ký thành công!!! <br\> Chào bạn: <b>' + user.username + ' </b>, vui lòng liên hệ admin và báo tên user, để được cấp quyền')
    }



  

})

router.get('/viewyeucau',authenticated, async (req, res) => {
  let user = await xulydb.timUser(req.user.username)
  const successMessage = req.flash('success')[0]
  res.render('layoutkythuat/main/view_guiyc', { data: user, successMessage })
})

router.get('/info',authenticated, async (req, res) => {
  
    var user = await xulydb.timUser(req.user.username)
    let mayeucau = req.query.mayeucau
    //console.log(mayeucau)
    let doc = await ycsc.timyctheoma(mayeucau)
    //console.log(doc)
    //let datafile = doc[0].filename
    //console.log(datafile)
    if (doc) {
      res.render('layoutkythuat/main/view_info', { data: doc, user: user, myPathENV: process.env.myPathENV })
    }
  
 
})

router.get('/viewtheobophan_daduyet',ruleAdmin, async (req, res) => {
  let bp = req.query.bophan
  let doc = await ycsc.timyctheobophan(bp)
  if (doc) {
    res.render('mainSbAdmin/viewsuachuatheophong', {data: doc,_username:''})
  }
})

// test biểu đồ thống kê
router.get('/bieudotron', ruleAdmin, async (req, res)=> {
  let total = await tongsuachuaton()
  res.render('rootadmin/bangduyetpyc',{_username:'', total: total},)
})

router.get('/tonghophoanthanh',ruleAdmin, async (req, res) => {
  let doc = await ycsc._doctatcayeucauhoanthanh('hoanthanh')
  if (doc) {
    res.render('mainSbAdmin/viewsuachuatheophong', {data: doc,_username:''})
  }
})

router.post('/updatekythuat', filemulter.upload.array('image2', 4), filemulter.handleError, async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      let fileName = req.files
      let ma = req.body.code
      let motacuakythuat = req.body.motacuakythuat
      let result = await ycsc.updatekythuat(ma, 'dangxuly', motacuakythuat, fileName)
      res.redirect('/qlkt/info?mayeucau=' + ma)
    } catch(e){
      res.send(e)
    }
  }else{
    res.redirect('/signin')
  }
} )

router.post('/updatehoanthanh', async(req, res) => {
  if(req.isAuthenticated()){
    try {
      let ma = req.body.code
      let trangthai = req.body.trangthai
      let result = await ycsc._updatetrangthai(ma, trangthai)
      res.send(result)
    } catch (error) {
      
    }
  }
})

router.post('/updatefeedback',authenticated, async(req, res) => {
  try {
   let ma = req.body.mayeucau
   let diem = req.body.diem
   let feedback = req.body.feedback
   let result = await ycsc._updatefeedback(ma, diem, feedback)
   res.send(result)
  } catch (error) {
    
  }
})

router.get('/tongsuachuaton', async(req, res)=>{
  let total =  await tongsuachuaton()
  res.json({total: total})
})

async function tongsuachuaton(){
  let bep = await ycsc.timyctheobophan('bep')
  let sales = await ycsc.timyctheobophan('sales')
  let mar =  await ycsc.timyctheobophan('mar')
  let fb =  await ycsc.timyctheobophan('fb')
  let ketoan = await ycsc.timyctheobophan('ketoan')
  let av = await ycsc.timyctheobophan('av')
  let house = await ycsc.timyctheobophan('house')
  let nhansu = await ycsc.timyctheobophan('nhansu')
  let khac = await ycsc.timyctheobophan('khac')
  let total = {
    bep: bep.length,
    sales: sales.length,
    mar: mar.length,
    fb: fb.length,
    ketoan: ketoan.length,
    av: av.length,
    house: house.length,
    nhansu: nhansu.length,
    khac: khac.length
  }
  return total
}

function authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function ruleAdmin(req, res, next) {
  if (req.isAuthenticated() && (req.user.role == 'admin' || req.user.role == 'root')) {
    return next();
  }
  
  res.redirect('/signin');
}

function ruleroot(req, res, next) {
  if (req.isAuthenticated()) {
    if(req.user.role == 'root'){
      return next();
    }else{
      res.redirect('/qlkt/bieudotron')
    }
    
  }
  res.redirect('/signin');
}



module.exports = router