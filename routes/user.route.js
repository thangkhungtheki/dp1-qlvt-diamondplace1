var express = require("express")
var router =  express.Router()
var passport = require("../config/passport")
var xulydb = require("../CRUD/xulydb")
router.get("/", (req, res, next) => {
    res.render("index")
})

router.get("/signin", (req, res , next) => {
    // hien thi trang va truyen lai nhung tin nhan tu phia server neu co
    var messages = req.flash('error')
    res.render("signin",{
        messages: messages,
        hasErrors: messages.length > 0
    })
})

router.post("/signin",
    passport.authenticate('local.signin', { successRedirect: '/vattutest',
                                  failureRedirect: '/signin',
                                  failureFlash: true })
);

router.post("/signup", 
passport.authenticate('local.signup', { successRedirect: '/signin',
                                  failureRedirect: '/signup',
                                  failureFlash: true })
);

/* GET sign-up page. */
router.get('/signup', function(req, res, next) {
    var messages = req.flash('error')
   
    res.render('signup',{ 
      messages: messages,
      hasErrors: messages.length > 0,
     })
  });

router.get('/dashboard', async(req, res) => {
    if(req.isAuthenticated()){
        if(await xulydb.find(req.user.username)){
            let data = await xulydb.docUser()
        //console.log(data)
            res.render("mainSbAdmin/dashboard",{
            _username: req.user.username,
            data: data,
            activeuser: 'active',
            activetb: '',
            activetbdp2: '',
            })
        }else res.redirect("/mavattutest")
        
    }else{
        res.redirect("/signin")
    }
})

router.get('/thietbi', async(req, res) => {
    if(req.isAuthenticated()){
        let data = await xulydb.docTb()
            res.render("mainSbAdmin/dbthietbi",{
            _username: req.user.username,
            data: data,
            activeuser: '',
            activetb: 'active',
            activetbdp2: '',
        })
    }else{
        res.redirect("/signin")
    }
})
var dat = {
    Ma: "",
    Mainboard: "",
    RAM: "",
    CPU: "",
    HardDisk: "",
    Monitor: "",
    VideoCard: "",
    OS: "",
    Notes: "",
    BoPhan: "",
    DeXuat: "",
    Loai: "",
    Nguoidung: "",
    Vitri: "",
}
router.get('/editthietbi', async(req, res) => {
    res.render("mainSbAdmin/dbthietbi-edit",{
        _username: req.user.username,
        activeuser: '',
        activetb: '',
        activetbdp2: 'active',
        data: dat,
    })
    // if(req.isAuthenticated()){
        
    //         res.render("mainSbAdmin/dbthietbi-edit",{
    //         _username: req.user.username,
    //         activeuser: '',
    //         activetb: '',
    //         activeedittb: 'active',
    //         Ma: req.params.id,
            
    //     })
    // }else{
    //     res.redirect("/signin")
    // }
})

router.get('/thietbidp2', async(req, res) => {
    if(req.isAuthenticated()){
        let data = await xulydb.docTbdp2()
            res.render("mainSbAdmin/dbthietbidp2",{
            _username: req.user.username,
            data: data,
            activeuser: '',
            activetb: '',
            activetbdp2: 'active',
        })
    }else{
        res.redirect("/signin")
    }
    
})

router.post('/suatb', async(req, res) => {
    res.render("mainSbAdmin/dbthietbi-edit",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            Ma: req.body.code,
})
})

router.post('/suatbdp2', async(req, res) => {
    res.render("mainSbAdmin/dbthietbi-edit-dp2",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: '',
            activetbdp2: '',
            Ma: req.body.code,
})
})

router.post('/delete', async(req, res) => {
    if(req.isAuthenticated()){
        let a = await xulydb.xoaTb(req.body.Ma)
        if(a == true){
            res.redirect("/thietbi")
        }else{
            res.send("Loi khong xoa duoc")
        }
        
               
    }else{
        res.redirect("/signin")
    }
       
})

router.post('/deletedp2', async(req, res) => {
    if(req.isAuthenticated()){
        let a = await xulydb.xoaTbdp2(req.body.Ma)
        if(a == true){
            res.redirect("/thietbidp2")
        }else{
            res.send("Loi khong xoa duoc")
        }
        
               
    }else{
        res.redirect("/signin")
    }
       
})

router.post('/searchedit', async(req, res) => {
    //console.log(req.body.txtsearch)
    let doc =  await xulydb.timTb(req.body.txtsearch)
    if(doc){
        //console.log(doc)
        res.render("mainSbAdmin/dbthietbi-edit",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: doc,
})
    }else{
        res.render("mainSbAdmin/dbthietbi-edit",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: dat,
        })
    }
    
    
})

router.post('/searcheditdp2', async(req, res) => {
    //console.log(req.body.txtsearch)
    let doc =  await xulydb.timTbdp2(req.body.txtsearch)
    if(doc){
        //console.log(doc)
        res.render("mainSbAdmin/dbthietbi-edit-dp2",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: doc,
})
    }else{
        res.render("mainSbAdmin/dbthietbi-edit-dp2",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: dat,
        })
    }
    
    
})

router.get("/themthietbi", (req, res) => {
    if(req.isAuthenticated()){
            res.render("mainSbAdmin/themthietbi",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: '',
            activetbdp2: '',
            activethem: '',
        })
    }else{
        res.redirect("/signin")
    }
})

router.get("/themthietbidp2", (req, res) => {
    if(req.isAuthenticated()){
            res.render("mainSbAdmin/themthietbidp2",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: 'active',
            
        })
    }else{
        res.redirect("/signin")
    }
})

router.post("/themtb",(req, res) => {
    let doc = {
        Ma: req.body.txtma,
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.themtb(doc)
    res.redirect("/themthietbi")
})

router.post("/themtbdp2",(req, res) => {
    let doc = {
        Ma: req.body.txtma,
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.themtbdp2(doc)
    res.redirect("/themthietbidp2")
})

router.post("/capnhat",(req, res) => {
    //console.log(req.body)
    let doc = {
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.updatetb(req.body.txtma,doc)
    res.redirect('/thietbi')
})

router.post("/capnhatdp2",(req, res) => {
    //console.log(req.body)
    let doc = {
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.updatetbdp2(req.body.txtma,doc)
    res.redirect('/thietbidp2')
})

router.post('/logout',(req, res) => {
    req.session.destroy()
    res.redirect('/signin')
})
var activedata = {
    activeuser: '',
    activetb: '',
    activetbdp2: '',
    activethem: 'active',
}
router.get('/vattutest', (req, res) => {
    if(req.isAuthenticated()){
        res.render("mainSbAdmin/vattu.ejs", {
            
            user: req.user,
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: 'active',
            
            
        })
    }else{
        res.redirect('signin')
    }
})

router.post('/timvattubyloai', async (req, res) => {
    let Loaivt = req.body.loai
    let doc = await xulydb.timvattu(Loaivt)
    res.send(doc)
})

router.post('/luunhapvattu', async(req, res) => {
    let doc = {
        Ma_vattu: req.body.Ma_vattu,
        Tenvattu: req.body.Tenvattu,
        username: req.user.username,
        ngaynhap: req.body.ngaynhap,
        soluong: req.body.soluong,
        ghichu: req.body.ghichu,
        loai: req.body.loai,
        
    }
    console.log(doc)
    
    await xulydb.luunhapvattu(doc)
    res.redirect('/vattutest')
})

router.get('/xuatvattutest', (req, res) => {
    // let slton = await 
    if(req.isAuthenticated()){
        res.render("mainSbAdmin/xuatvattu.ejs", {
            user: req.user, //tạm mở user
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
            
        })
    }else{
        res.redirect('signin')
    }
})

router.post('/luuxuatvattu', async(req, res) => {
    let doc = {
        Ma_vattu: req.body.Ma_vattu,
        Tenvattu: req.body.Tenvattu,
        username: req.user.username,
        ngayxuat: req.body.ngayxuat,
        soluong: req.body.soluong,
        lydoxuat: req.body.lidoxuat,
        loai: req.body.loai,
    }
    // console.log(doc)
    if(doc.lydoxuat !== ""){
        await xulydb.luuxuatvattu(doc)
        console.log(doc)
    }else{
    }
    
    res.redirect('/xuatvattutest')
})

router.get('/mavattutest', (req, res) => {
    if(req.isAuthenticated()){
        res.render("mainSbAdmin/themmavattu.ejs", {
        
            user: req.user, //tạm mở user
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
                 
        })
    }else{
        res.redirect('signin')
    }   
})

router.post('/luumavattu', async(req, res) => {
    let doc = {
        Ma_vattu: req.body.mavattu,
        Tenvattu: req.body.tenvattu,
        Loaivattu: req.body.loaivattu,
        
    }
    console.log(doc)
    
    await xulydb.luumavattu(doc)
    res.redirect('/mavattutest')
})

router.get('/timnhap', async(req, res) => {
    let soluong = await xulydb.timnhap('dl-04')
    console.log(soluong)
    res.send(200, soluong)
})

router.get('/timton/:ma', async(req, res) => {
    let ma = req.params.ma
    let slnhap = await xulydb.timnhap(ma)
    console.log('số lương nhập: ' + slnhap)
    let slxuat =  await xulydb.timxuat(ma)
    console.log('Số lượng xuất: ' + slxuat)
    let slton = slnhap - slxuat
    res.send({
        slxuat: slxuat,
        slnhap: slnhap,
        slton: slton,
    })
})

router.get('/baocaovattu', async (req, res) => {

    if (req.isAuthenticated()) {
        let data = await xulydb.baocaovattu()
        //console.log(data)
        res.render("mainSbAdmin/baocaovattu.ejs", {

            user: req.user, //tạm mở user
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
            data: data,

        })
    } else {
        res.redirect('signin')
    }

})

//---------------------------------------------------

router.get('/chart', (req, res) => {
    res.render("mainSbAdmin/main-chart.ejs",{
        user: "req.user", //tạm mở user
        activeuser: '',
        activetb: '',
        activetbdp2: '',
        activethem: '',
        
    })

})
router.get('/chitiettheoma', async(req, res) => {

    if (req.isAuthenticated()) {
        let data = await xulydb.baocaovattu()
        //console.log(data)
        res.render("mainSbAdmin/chitiettheoma_tenuser",{
            user: req.user, //tạm mở user
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
            
        })
    
    } else {
        res.redirect('signin')
    }

})

router.post('/timxuatvattu', async(req, res) => {
    let data = await xulydb.timxuatvattu(req.body.loai)
    res.send(data)
})

module.exports = router