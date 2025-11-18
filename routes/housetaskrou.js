var express = require("express")
var router =  express.Router()
var xuly = require('../CRUD/housetask')
var taskkiemtradinhky = require("../CRUD/taskkiemtradinhky")
var moment = require('moment')
const exceljs = require('exceljs');
const fs = require('fs')
const axios = require('axios');
const path = require('path')
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { console } = require("inspector");
const filemulter = require('../multer-upload/multer');

router.get('/api/them', async function(req, res){
    let docs = await xuly.docs({})
    res.render('admin_house/main/view_them_housetask', {docs, moment})
})
router.get('/api/view', async function(req, res){
    const khuvuc = req.query.khuvuc || ''
    let docs = await xuly.docs({khuvuc: {$regex: khuvuc}})
    res.render('admin_house/main/view_housetask', {data: docs, moment})
})
router.get('/api/congviec/:id', async (req, res) => {
    let body = req.params.id
    let docs = await xuly.docs({_id: body})
    // console.log(docs)
    res.send({cv: docs[0]})
})
router.get('/app/house/congviec', async (req, res) => {
    let body = req.query.id
    let docs = await xuly.docs({_id: body})
    // console.log(docs)
    res.json(docs[0])
})
router.post('/api/congviec/update', async (req, res) => {

        let id = req.body._id
        let body = {
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            ngaybatdau: req.body.ngaybatdau,
            ngayketthuc: req.body.ngayketthuc,
            motacongviec: req.body.motacongviec,
            solanlam: req.body.solanlam,
            congviectheothang: req.body.congviectheothang,
            lichsucv: req.body.lichsucv,
            thoigian: req.body.thoigian,
            songaynhacthongbao: req.body.songaynhacthongbao,
            lichsukiemtra: req.body.lichsukiemtra
        }
        let result = await xuly.update(id, body)
        await axios.get('https://files.diamondplace.org/housetask/api/capnhatmaqrcochu')
        if(result){
            res.redirect('/housetask/api/view')
        }else{
            res.send('Cập nhật không thành công')
        }

})
router.post('/api/congviec/them', async (req, res) => {

        let body = {    
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            congviectheothang: req.body.congviectheothang,
            ngaybatdau: req.body.ngaybatdau,
            ngayketthuc: req.body.ngayketthuc,     
            solanlam: req.body.solanlam,
            thoigian: req.body.thoigian,
            songaynhacthongbao: req.body.songaynhacthongbao,
            motacongviec: req.body.motacongviec,
            lichsucv: req.body.lichsucv,
            lichsukiemtra: req.body.lichsukiemtra
        }
        let result = await xuly.create(body)
        await axios.get('https://files.diamondplace.org/housetask/api/capnhatmaqr') 
        await axios.get('https://files.diamondplace.org/housetask/api/capnhatmaqrcochu')
        if(result){
            res.redirect('/housetask/api/view')
        }else{
            res.send('Thêm công việc không thành công')
        }

})
router.post('/api/congviec/delete', async (req, res) => {
    let id = req.body._id
    let result = await xuly.deletes(id)
    if(result){
        res.status(200).send('Xóa công việc thành công')
    }else{
        res.status(500).send('Xóa công việc không thành công')
    }
    
})
router.get('/api/capnhatmaqr', async(req, res) => {
    // Lấy dữ liệu từ MongoDB
    const documents = await xuly.docs({});
            // Thêm dữ liệu vào worksheet
    documents.forEach(async(document) => {
        let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + document.id
        try {
            // 1. Tải ảnh từ URL
            if(!document.maqr){
                const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
                const imageBuffer = response.data;
                var base64Image = Buffer.from(imageBuffer).toString('base64');
            }else{
                var base64Image = document.maqr
            }
            
            const docss = {
                khuvuc: document.khuvuc,
                vitri: document.vitri,
                tencv: document.tencv,
                ngaybatdau: document.ngaybatdau,
                ngayketthuc: document.ngayketthuc,
                motacongviec: document.motacongviec,
                solanlam: document.solanlam,
                mota: document.mota,
                thoigian: document.thoigian,
                songaynhacthongbao: document.songaynhacthongbao,
                lichsucv: document.lichsucv,
                lichsukiemtra: document.lichsukiemtra,
                maqr: base64Image
            }
            let result = await xuly.update(document.id ,docss)
            console.log(base64Image)
        }catch(e){
            console.log("Loi: ", document.id)
        }
    });
    res.send('make by thang khung the ki')
})
async function maqrcochu(docs) {
  try {
        const documents = docs
        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: 'No device documents found.' });
        }

        const docss = documents
        const defaultImagePath = path.join(__dirname, 'img', 'default-background-1.png');

        let backgroundImage;
        try {
            backgroundImage = await loadImage(defaultImagePath);
        } catch (err) {
            console.log('Failed to load background image', err);
            // return res.status(500).json({ message: 'Failed to load background image' });
        }

        if (!docss || !docss.maqr) {
             console.log('ko co data maqr');
        }
        // console.log(docss)
        const deviceName = docss.tencv || 'Tên Công Việc';
        const location = docss.vitri || 'Vị trí công việc';
        const qrCodeImageBuffer = Buffer.from(docss.maqr, 'base64');
        const qrImage = await loadImage(qrCodeImageBuffer);

        // Tạo canvas với kích thước ảnh nền
        const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
        const ctx = canvas.getContext('2d');

        // Vẽ nền
        ctx.drawImage(backgroundImage, 0, 0);

        // Tính vị trí và vẽ QR
        const qrSize = 200;
        const qrLeft = (backgroundImage.width - qrSize) / 2;
        const qrTop = (backgroundImage.height - qrSize) / 2;
        ctx.drawImage(qrImage, qrLeft, qrTop, qrSize, qrSize);

        // Vẽ TÊN CÔNG VIỆC (dòng trên)
        const fontSizeTop = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeTop}px Arial`;
        ctx.fillStyle = 'lime';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const deviceNameY = Math.round(backgroundImage.height * 0.1);
        ctx.textAlign = 'center';
        ctx.strokeText(deviceName, backgroundImage.width / 2, deviceNameY);
        ctx.fillText(deviceName, backgroundImage.width / 2, deviceNameY);

        // Vẽ VỊ TRÍ (dòng dưới)
        const fontSizeBottom = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeBottom}px Arial`;
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const locationY = Math.round(backgroundImage.height * 0.95);
        ctx.strokeText(location, backgroundImage.width / 2, locationY);
        ctx.fillText(location, backgroundImage.width / 2, locationY);

        // Xuất ra base64
        const finalBuffer = canvas.toBuffer('image/png');
        const finalBase64 = finalBuffer.toString('base64');
        return finalBase64
    } catch (error) {
        console.log('Lỗi xử lý canvas: ', error);
        
    }
}
router.get('/api/capnhatmaqrcochu', async(req, res) => {
    // Lấy dữ liệu từ MongoDB
    const documents = await xuly.docs({});
            // Thêm dữ liệu vào worksheet
    documents.forEach(async(document) => {
    //console.log(document)
        let resultmaqrcochu = await maqrcochu(document)
        try {
            const docss = {
                khuvuc: document.khuvuc,
                vitri: document.vitri,
                tencv: document.tencv,
                ngaybatdau: document.ngaybatdau,
                ngayketthuc: document.ngayketthuc,
                motacongviec: document.motacongviec,
                solanlam: document.solanlam,
                congviectheothang: document.congviectheothang,
                mota: document.mota, // không sử dụng
                thoigian: document.thoigian,
                songaynhacthongbao: document.songaynhacthongbao,
                lichsucv: document.lichsucv,
                lichsukiemtra: document.lichsukiemtra,
                maqr: document.maqr,
                maqrcochu: resultmaqrcochu
                
            }
            let result = await xuly.update(document.id ,docss)
            console.log('Success')
        }catch(e){
            console.log("Loi: ", document.id)
        }
    });
    res.send('make by thang khung the ki maqrcochu')
})
// 📤 Upload ảnh thực hiện công việc
// router.put(
//   '/api/upload-thuchien',
//   filemulter.upload.array('image', 5),
//   filemulter.handleError,
//   async (req, res) => {
//     try {
      
//       const { idcongviec, phong, noidung, nguoithuchien } = req.body;

//       if (!req.files || req.files.length === 0) {
//         req.flash('error', 'Không có ảnh được tải lên');
//         return res.redirect('/qlhouse');
//       }

//       // Chuyển từng ảnh sang base64 (chỉ mã hóa phần data, không có prefix)
//       const base64Images = await Promise.all(
//         req.files.map(async (file) => {
//           const filePath = file.path;

//           // Resize tối thiểu 500x500, format PNG
//           const resizedBuffer = await sharp(filePath)
//             .resize({
//               width: 500,
//               height: 500,
//               fit: sharp.fit.cover,
//             })
//             .png()
//             .toBuffer();

//           // Encode Base64 — chỉ lấy chuỗi encode
//           const base64String = resizedBuffer.toString('base64');

//           // Xóa file gốc
//           fs.unlinkSync(filePath);

//           return base64String;
//         })
//       );

//       // Lưu vào MongoDB
//       const newRecord = {
//         ngay: new Date().toISOString().split('T')[0],
//         idcongviec,
//         phong,
//         noidung,
//         nguoithuchien,
//         imgthuchien: base64Images,
//         nguoikiemtra: 'chưa kiểm tra',
//       };

//       await taskkiemtradinhky.creates(newRecord);

//       req.flash('success', 'Tải ảnh và lưu dữ liệu thành công!');
//       res.redirect('/qlhouse');
//     } catch (error) {
//       console.error('❌ Lỗi upload ảnh:', error);
//       res.status(500).send('Lỗi khi xử lý ảnh');
//     }
//   }
// );
router.put(
  '/api/upload-thuchien',async (req, res) => {
    try {
        const idcongviec = req.body.idcongviec;
        const phong = req.body.phong;
        const noidung = req.body.noidung;
        const nguoithuchien = req.body.nguoithuchien;
        const imgthuchien = req.body.imgthuchien; // Mảng base64 từ client
        // if (!imgthuchien || imgthuchien.length === 0) {
        //     console.log('error', 'Không có ảnh được tải lên');
        //     return res.redirect('/qlhouse');
        // }
        // Lưu vào MongoDB
        const newRecord = {
            ngay: new Date().toISOString().split('T')[0],     
            idcongviec: idcongviec,
            phong: phong,
            noidung: noidung,
            nguoithuchien: nguoithuchien,
            imgthuchien: imgthuchien, // Mảng base64 từ client
            nguoikiemtra: 'chưa kiểm tra',
        };
        
        let docss = await xuly.docs({_id: idcongviec});
        
        let dongMoi = `${newRecord.ngay} ${newRecord.noidung}`;
        var lichsucv;
        if (docss[0].lichsucv) {
            lichsucv = docss[0].lichsucv + `\n${dongMoi}`;
        } else {
            lichsucv = dongMoi;
        }
        
        // console.log('>>>docs[0]: ', docs[0]);
        // console.log(">>>Lich sucv: ", lichsucv)
        let result = await xuly.xulyupdate_lichsucv(idcongviec, lichsucv);
        let resultCreate = await taskkiemtradinhky.creates(newRecord);
        
        res.send("Tải ảnh và lưu dữ liệu thành công!");
    } catch (error) {
        console.log('❌ Lỗi upload ảnh:', error);
        res.status(500).send('Lỗi khi xử lý ảnh');
    }
  }
);
module.exports = router