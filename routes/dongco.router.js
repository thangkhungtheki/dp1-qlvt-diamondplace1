var express = require("express")
var router =  express.Router()
var xulydongco = require('../CRUD/db.dongco')
var moment = require('moment')
const exceljs = require('exceljs');
const fs = require('fs')
const ycsc = require('../CRUD/xulyyeucau')
const axios = require('axios');
var xulydbuser = require("../CRUD/xulydb")
const path = require('path')
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');
const maildinhky = require('../sendmail/maildinhkysuachuathang')
const baotrisuachua = require("../CRUD/baotrisuachua")

// Middleware để thiết lập dữ liệu trong res.locals
router.use(async (req, res, next) => {
  let total = await tongsuachuaton()
  res.locals.arrayTong = total
  next();
});
async function tongsuachuaton() {
  let bep = await ycsc.timyctheobophan('bep')
  let sales = await ycsc.timyctheobophan('sales')
  let marketing = await ycsc.timyctheobophan('marketing')
  let fb = await ycsc.timyctheobophan('fb')
  let ketoan = await ycsc.timyctheobophan('ketoan')
  let av = await ycsc.timyctheobophan('avtrangtri')
  let house = await ycsc.timyctheobophan('house')
  let nhansu = await ycsc.timyctheobophan('nhansu')
  let baove = await ycsc.timyctheobophan('baove')
  let khac = await ycsc.timyctheobophan('khac')
  let total = {
    bep: bep.length,
    sales: sales.length,
    marketing: marketing.length,
    fb: fb.length,
    ketoan: ketoan.length,
    av: av.length,
    house: house.length,
    nhansu: nhansu.length,
    baove: baove.length,
    khac: khac.length
  }
  return total
}

router.get('/view', async(req, res) => {
    const daynow = moment().format('DD-MM-YYYY');
    const data = await xulydongco.doc_dongco()
    res.render('mainSbAdmin/dongcoview',{
        _username : '',
        daynow: daynow,
        data: data
    
    })
})

router.get('/phanloai', async(req, res) => {
    const daynow = moment().format('DD-MM-YYYY');
    const loai = req.query.loai
    const data = await xulydongco.loai_dongco(loai)
    res.render('mainSbAdmin/dongcoview',{
        _username : '',
        daynow: daynow,
        data: data
    
    })
})

router.get('/themdongco', (req, res) => {
    res.render('mainSbAdmin/dongco_them',{_username: ''})
})

router.post('/taodongco', async(req, res) => { 
    let ngaymua = moment(req.body.ngaymua,'YYYY-MM-DD')
    let ngayhethan = moment(req.body.ngayhethan,'YYYY-MM-DD')
    let doc = {
        tenthietbi: req.body.tentb,
        loai: req.body.selectloai,
        ngaymua: ngaymua.format('YYYY-MM-DD') || null,
        ngayhethan: ngayhethan.format('YYYY-MM-DD') || null,
        vitri: req.body.vitri,
        congsuat: req.body.congsuat,
        model: req.body.model,
        dienap: req.body.dienap,
        mota: req.body.mota,
        lichsu: req.body.lichsu,
    }
    console.log(doc)
    let result = await xulydongco.tao_dongco(doc)
    if(result){
        req.flash('success',' Đã thêm thành công: ' +  doc.tenthietbi)
        const msg = req.flash('success')
        return res.render('mainSbAdmin/dongco_them',{
            _username: '',
            msg
        })
    }else {
        req.flash('not','Lỗi server ... thử lại sau')
        const msge = req.flash('not')
        return res.render('mainSbAdmin/dongco_them',{
            _username: '',
            msge
        })
    }
})

router.post('/xoadongco', async(req, res)=>{
    let id = req.body.id
    const result = await xulydongco.delete_dongco(id)
    // if(result){
    //     return res.redirect('/dongco/view')
    // }else{
        res.end()
    // }
})

router
.get('/suadongco', async (req, res) => {
    let id = req.query.id
    let result = await xulydongco.timdongcotheoID(id)
    if(result){
        return res.render('mainSbAdmin/dongco_sua', {_username: '',data: result})
    }else{
        res.end()
    }
})
.post('/suadongco', async(req, res) => {
    let ngaymua = moment(req.body.ngaymua,'YYYY-MM-DD')
    let ngayhethan = moment(req.body.ngayhethan,'YYYY-MM-DD')
    let doc = {
        tenthietbi: req.body.tentb,
        loai: req.body.selectloai,
        ngaymua: ngaymua.format('YYYY-MM-DD'),
        ngayhethan: ngayhethan.format('YYYY-MM-DD'),
        vitri: req.body.vitri,
        congsuat: req.body.congsuat,
        model: req.body.model,
        dienap: req.body.dienap,
        mota: req.body.mota,
        lichsu: req.body.lichsu,
    }
    let id = req.body.id
    let result = await xulydongco.update_dongco(id,doc)
    if(result){
        return res.redirect('/dongco/view')
    }else{
        res.end()
    }
})

router.get('/xuatexceldongco', async(req, res) => {
    try {
        let documents = await xulydongco.doc_dongco();
    
        if (!Array.isArray(documents)) {
          documents = Object.values(documents);
        }
    
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('DongcoMayLanh');
    
        // Định nghĩa các cột và thuộc tính border
        const columns = [
          { header: 'ID', key: 'idthietbi', width: 15 },
          { header: 'Tên Thiết Bị', key: 'tenthietbi', width: 30 },
          { header: 'Loại', key: 'loai', width: 20 },
          { header: 'Ngày Mua', key: 'ngaymua', width: 15 },
          { header: 'Ngày Hết Hạn', key: 'ngayhethan', width: 15 },
          { header: 'Vị Trí', key: 'vitri', width: 25 },
          { header: 'Công Suất', key: 'congsuat', width: 15 },
          { header: 'Model', key: 'model', width: 20 },
          { header: 'Điện Áp', key: 'dienap', width: 15 },
          { header: 'Mô tả', key: 'mota', width: 30 },
          { header: 'Lịch sử', key: 'lichsu', width: 30 },
          { header: 'QR Code', key: 'qrcode', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
        ];
        worksheet.columns = columns;
    
        const qrCodeColumnIndex = 10; // Index cột 'QR Code' (0-based)
        const desiredImageWidth = 80; // Kích thước mong muốn của ảnh trong Excel (pixels)
        const desiredImageHeight = 80;
    
        for (const [index, document] of documents.entries()) {
          const rowNumber = index + 2;
    
          worksheet.addRow({
            idthietbi: document.id,
            tenthietbi: document.tenthietbi,
            loai: document.loai,
            ngaymua: document.ngaymua,
            ngayhethan: document.ngayhethan,
            vitri: document.vitri,
            congsuat: document.congsuat,
            model: document.model,
            dienap: document.dienap,
            mota: document.mota,
            lichsu: document.lichsu,
            qrcode: '',
          });
    
          if (document.maqrcochu) {
            try {
              const base64Data = document.maqrcochu.replace(/^data:image\/\w+;base64,/, '');
              const imageBuffer = Buffer.from(base64Data, 'base64');
    
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: 'png',
              });
    
              const qrCodeCell = worksheet.getCell(rowNumber, qrCodeColumnIndex + 1);
    
              const topLeft = { col: qrCodeCell.col - 1, row: qrCodeCell.row - 1 };
    
              worksheet.addImage(imageId, {
                tl: topLeft,
                ext: { width: desiredImageWidth, height: desiredImageHeight },
                editAs: 'oneCell',
              });
    
              worksheet.getRow(rowNumber).height = desiredImageHeight * 0.75;
            } catch (error) {
              console.error(`Lỗi xử lý QR code cho ${document.tenthietbi}:`, error);
            }
          } else {
            worksheet.getRow(rowNumber).height = 20;
          }
        }
    
        // Đóng khung toàn bộ bảng
        const lastRow = documents.length + 1; // Cộng thêm 1 cho hàng header
        const lastColumn = columns.length;
    
        const range = `A1:${String.fromCharCode(64 + lastColumn)}${lastRow}`;
        const borderStyles = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
    
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          row.eachCell((cell, colNumber) => {
            cell.border = borderStyles;
          });
        });
    
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=dp1.dongcomaylanh.xlsx');
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error('Lỗi tổng:', error);
        res.status(500).send('Internal Server Error');
      }
})
router.get('/api/capnhatmaqr', async(req, res) => {
    // Lấy dữ liệu từ MongoDB
    const documents = await xulydongco.doc_dongco();
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
                tenthietbi: document.tenthietbi,
                loai: document.loai,
                ngaymua: document.ngaymua,
                ngayhethan: document.ngayhethan,
                vitri: document.vitri,
                congsuat: document.congsuat,
                model: document.model,
                dienap: document.dienap,
                mota: document.mota,
                lichsu: document.lichsu,
                maqr: base64Image
            }
            let result = await xulydongco.update_dongco(document.id ,docss)
            console.log(base64Image)
        }catch(e){
            console.log("Loi: ", document.id)
        }
    });
    res.send('make by thang khung the ki')
})


router.get('/dongcoapi', async(req, res) => {
  let id = req.query.id 
  let result = await xulydongco.timdongcotheoID(id)
  res.json(result)
})

router.get('/checkuser', async (req, res) => {
  let email = req.query.email
  let result = await xulydbuser.docUseremail(email)
  if(result){
    res.json({
      ten: result.ten,
      congty: result.congty,
      phong: result.bp || null,
      email: result.mail
    })
  }else{
    res.send(false)
  }
})
router.get('/api/suadongcomany', async (req, res) => {
  let result = await xulydongco.suadatabase()
  res.send(result)
})
router.get('/api/anh1',(req,res) => {
  const imagePath =path.join(__dirname,'/img/anhdau.jpg'); // Giả sử có 1 ảnh lớn

  // Đảm bảo file tồn tại
  if (!fs.existsSync(imagePath)) {
    console.log(imagePath)
    return res.status(404).send('Image not found');
  }

  const stat = fs.statSync(imagePath);
  res.setHeader('Content-Type', 'image/jpeg'); // Hoặc image/png, image/gif
  res.setHeader('Content-Length', stat.size); // Tùy chọn: giúp client biết kích thước file

  const readStream = fs.createReadStream(imagePath);

  // Pipe stream dữ liệu ảnh trực tiếp đến response
  readStream.pipe(res);

  readStream.on('error', (err) => {
    console.error('Error streaming image:', err);
    res.status(500).send('Error serving image');
  });

  readStream.on('end', () => {
    // console.log('Image streamed successfully.'); // Không cần thiết, nhưng có thể dùng để debug
  });
})
router.get('/api/anh2',(req,res) => {
  const imagePath1 = path.join(__dirname,'img/anhcuoi.jpg'); 
  // Đảm bảo file tồn tại
  if (!fs.existsSync(imagePath1)) {
    return res.status(404).send('khong có ảnh');
  }

  const stat = fs.statSync(imagePath1);
  res.setHeader('Content-Type', 'image/jpeg'); // Hoặc image/png, image/gif
  res.setHeader('Content-Length', stat.size); // Tùy chọn: giúp client biết kích thước file

  const readStream = fs.createReadStream(imagePath1);

  // Pipe stream dữ liệu ảnh trực tiếp đến response
  readStream.pipe(res);

  readStream.on('error', (err) => {
    console.error('Error streaming image:', err);
    res.status(500).send('Error serving image');
  });

  readStream.on('end', () => {
    // console.log('Image streamed successfully.'); // Không cần thiết, nhưng có thể dùng để debug
  });
})
// PUT /api/dongco/update-lichsu/:id
// Cập nhật thêm lịch sử cho một thiết bị dựa trên ID
// Cập nhật thêm lịch sử (nối chuỗi) cho một thiết bị dựa trên ID, dùng query parameter
router.put('/update-lichsu-string', async (req, res) => {
  try {
      let  id  = req.body.id; // Lấy ID của thiết bị từ URL params
      let  newHistoryEntry  = req.body.lichsu; // Lấy dòng lịch sử mới từ query parameters
      
      // Kiểm tra xem có dòng lịch sử mới được gửi lên không
      if (!newHistoryEntry) {
          return res.status(400).json({ message: 'Dữ liệu lịch sử mới không được cung cấp trong query parameter (newHistoryEntry).' });
      }

      // Tìm thiết bị để lấy lịch sử cũ
      const dongcoToUpdate = await xulydongco.timdongcotheoID(id);

      if (!dongcoToUpdate) {
          return res.status(404).json({ message: 'Không tìm thấy thiết bị với ID này.' });
      }

      // Tạo dòng lịch sử mới (thêm dấu ngắt dòng hoặc phân cách nếu muốn)
      let updatedLichsu;
      const daynow1 = moment().format('DD-MM-YYYY');
      newHistoryEntry = daynow1 + " " + newHistoryEntry
      if (dongcoToUpdate.lichsu) {
          // Nối chuỗi, thêm dấu phẩy và khoảng trắng để phân cách các mục lịch sử
          // updatedLichsu = `${dongcoToUpdate.lichsu}, ${newHistoryEntry}`;
          // Hoặc nếu muốn xuống dòng (trong text area chẳng hạn):
         
          updatedLichsu = `${dongcoToUpdate.lichsu}\n${newHistoryEntry}`;
      } else {
          // Nếu lichsu chưa có gì, thì đây là dòng đầu tiên
          updatedLichsu = newHistoryEntry;
      }

      // Cập nhật trường lichsu
      let updatedDongco = await xulydongco.xulyupdale_lichsu(id, updatedLichsu);
      // Ghi lại lịch sử vào collection bảo trì sửa chữa
      let re = /^(\d{2}-\d{2}-\d{4})\s+([A-Za-zÀ-ỹ\s]+?):/m
      let m = newHistoryEntry.match(re);
      if (m) {
        const date = m[1]; // "30-09-2025"
        const name = m[2]; // "Chung Nguyen Thanh Long"
      }
      let baotri = {
        ngay: moment().format('DD-MM-YYYY'),
        idthietbi: id,
        phong: 'KYTHUAT',
        noidung: newHistoryEntry,
        nguoithuchien:  m?.[2] || 'KHONGXACDINH',
        noidunglaychonhanh: dongcoToUpdate.tenthietbi + " " + dongcoToUpdate.vitri + ": " + newHistoryEntry
      }
      console.log(m)
      let kq = await baotrisuachua.create_suachua(baotri)
      console.log('ket qua them lich su bao tri: ', kq)
      // Trả về phản hồi thành công
      res.status(200).json({
          message: 'Cập nhật lịch sử (nối chuỗi) thành công!',
          dongco: updatedDongco
      });

  } catch (error) {
      console.error('Lỗi khi cập nhật lịch sử (nối chuỗi):', error);
      res.status(500).json({ message: 'Lỗi server nội bộ.', error: error.message });
  }
});

// Hàm tiện ích để escape các ký tự đặc biệt trong XML
function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') {
        unsafe = String(unsafe); // Đảm bảo chuyển đổi thành chuỗi để xử lý
    }
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c; // Trường hợp không khớp, trả về ký tự gốc
        }
    });
}

// Route API để tạo ảnh composite
// router.get('/generate-device-report', async (req, res) => {
//     try {
//         // Giả sử xulydongco.doc_dongco() trả về một mảng các documents từ MongoDB
//         const documents = await xulydongco.doc_dongco(); // Giữ nguyên hàm lấy dữ liệu của bạn
        
//         if (!documents || documents.length === 0) {
//             return res.status(404).json({ message: 'No device documents found.' });
//         }

//         const docss = documents[0]; // Lấy document đầu tiên

//         // --- Đường dẫn và đọc ảnh nền mặc định ---
//         // Đảm bảo đường dẫn này đúng. Ví dụ:
//         // Nếu default-background.png nằm trong thư mục 'img' ngang hàng với file route này
//         const defaultImagePath = path.join(__dirname, 'img', 'default-background.png');
        
//         let initialImageBuffer;
//         try {
//             // fs.readFileSync sẽ trả về Buffer trực tiếp, không cần chuyển đổi Base64
//             initialImageBuffer = fs.readFileSync(defaultImagePath);
//             console.log('Successfully read default background image:', defaultImagePath);
//         } catch (readError) {
//             console.error('Error reading default background image at path:', defaultImagePath, readError);
//             return res.status(500).json({ message: 'Default background image not found or unreadable. Please check the path and file existence.' });
//         }
//         // --- Kết thúc đọc ảnh mặc định ---

//         // Kiểm tra dữ liệu cần thiết
//         if (!docss || !initialImageBuffer || !docss.maqr) {
//             // initialImageBuffer đã là Buffer, không phải Base64 string
//             return res.status(400).json({ message: 'Missing required data (device data, background image, or QR code).' });
//         }

//         // Lấy dữ liệu từ docss và escape các ký tự đặc biệt cho SVG
//         const deviceName = escapeXml(docss.tenthietbi); // ÁP DỤNG ESCAPE Ở ĐÂY
//         const location = escapeXml(docss.vitri);       // ÁP DỤNG ESCAPE Ở ĐÂY
//         const qrCodeImageBase64 = docss.maqr;

//         console.log('Device Name:', deviceName); // Log tên thiết bị đã được escape

//         // --- 1. Xử lý ảnh với Sharp ---
//         // initialImageBuffer đã là Buffer, không cần Buffer.from(..., 'base64') nữa
//         const qrCodeImageBuffer = Buffer.from(qrCodeImageBase64, 'base64');

//         const metadata = await sharp(initialImageBuffer).metadata();
//         const initialWidth = metadata.width;
//         const initialHeight = metadata.height;

//         const qrSize = 200; // Kích thước QR code đã có sẵn là 200px
//         const qrLeft = Math.max(0, (initialWidth - qrSize) / 2);
//         const qrTop = Math.max(0, (initialHeight - qrSize) / 2);

//         const resizedQrCodeBuffer = qrCodeImageBuffer; // Dùng trực tiếp vì kích thước đã 200px

//         // Ghép QR code lên ảnh nền
//         const compositeImageBuffer = await sharp(initialImageBuffer)
//             .composite([
//                 {
//                     input: resizedQrCodeBuffer,
//                     left: Math.round(qrLeft),
//                     top: Math.round(qrTop),
//                 },
//             ])
//             .toBuffer();

//         // --- 2. Thêm text vào ảnh (Sử dụng Sharp với SVG overlay)---
//         // Tính toán kích thước font chữ và vị trí dựa trên kích thước ảnh gốc
//         const deviceNameFontSize = Math.round(initialWidth * 0.05); // Tùy chỉnh hệ số để thay đổi kích thước chữ
//         const deviceNameY = Math.round(initialHeight * 0.05);        // Vị trí Y của tên thiết bị (10% từ trên)

//         const locationFontSize = Math.round(initialWidth * 0.05);  // Đặt cùng kích thước với tên thiết bị hoặc tùy chỉnh
//         const locationY = Math.round(initialHeight * 0.7);         // Vị trí Y của vị trí (90% từ trên)

//         // Tạo SVG cho phần tên thiết bị
//         const svgTextTop = `
//             <svg >
//                 <style>
//                      .device-name-text {
//                         font-family: Arial, sans-serif;
//                         font-size: ${deviceNameFontSize}px;
//                         fill: yellow;      /* Màu chữ: Vàng sáng */
//                         stroke: black;     /* Viền chữ: Đen */
//                         stroke-width: 2px; /* Độ dày viền: 2px (có thể điều chỉnh) */
//                         text-anchor: middle;
//                         font-weight: bold;
//                     }
//                 </style>
//                 <text x="${initialWidth / 2}" y="${deviceNameY}" class="device-name-text">Đây là dòng test trên</text>
//             </svg>
//         `;

//         // Tạo SVG cho phần vị trí
//         const svgTextBottom = `
//             <svg >
//                 <style>
//                     .location-text { font-family: Arial, sans-serif;
//                         font-size: ${locationFontSize}px;
//                         fill: yellow;      /* Màu chữ: Vàng sáng */
//                         stroke: black;     /* Viền chữ: Đen */
//                         stroke-width: 2px; /* Độ dày viền: 2px (có thể điều chỉnh) */
//                         text-anchor: middle; 
//                         }
//                 </style>
//                 <text x="${initialWidth / 2}" y="${locationY}" class="location-text">Đây là dòng text dưới</text>
//             </svg>
//         `;

//         // Ghép các lớp SVG text lên ảnh composite
//         const finalImageBuffer = await sharp(compositeImageBuffer)
//             .composite([
//                 { input: Buffer.from("svgTextTop"),  top: 0, left: 0, blend: 'overlay' },
//                 { input: Buffer.from("svgTextBottom"), top: 0, left: 0, blend: 'overlay' },
//             ])
//             .png() // Quan trọng: Xuất ra PNG để giữ chất lượng và hỗ trợ trong suốt
//             .toBuffer()
           
//         // --- 3. Trả về chuỗi base64 của ảnh ---
//         const finalImageBase64 = finalImageBuffer.toString('base64');
//         res.status(200).json({ imageBase64: finalImageBase64 });

//     } catch (error) {
//         console.error('Error generating composite image:', error);
//         res.status(500).json({ message: 'Failed to generate composite image.', error: error.message });
//     }
// });

router.get('/generate-device-maqrcochu', async (req, res) => {
    try {
        const documents = await xulydongco.doc_dongco();
        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: 'No device documents found.' });
        }

        const docss = documents[0];
        const defaultImagePath = path.join(__dirname, 'img', 'default-background.png');

        let backgroundImage;
        try {
            backgroundImage = await loadImage(defaultImagePath);
        } catch (err) {
            console.error('Failed to load background image', err);
            return res.status(500).json({ message: 'Failed to load background image' });
        }

        if (!docss || !docss.maqr) {
            return res.status(400).json({ message: 'Missing QR code or device data.' });
        }

        const deviceName = docss.tenthietbi || 'Tên thiết bị';
        const location = docss.vitri || 'Vị trí thiết bị';
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

        // Vẽ TÊN THIẾT BỊ (dòng trên)
        const fontSizeTop = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeTop}px Arial`;
        ctx.fillStyle = 'yellow';
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
        res.status(200).json({ imageBase64: finalBase64 });

    } catch (error) {
        console.error('Lỗi xử lý canvas:', error);
        res.status(500).json({ message: 'Lỗi tạo ảnh bằng canvas.', error: error.message });
    }
    
})

router.get('/api/capnhatmaqrcochu', async(req, res) => {
    // Lấy dữ liệu từ MongoDB
    const documents = await xulydongco.doc_dongco();
            // Thêm dữ liệu vào worksheet
    documents.forEach(async(document) => {
    //console.log(document)
        let resultmaqrcochu = await maqrcochu(document)
        try {
            const docss = {
                tenthietbi: document.tenthietbi,
                loai: document.loai,
                ngaymua: document.ngaymua,
                ngayhethan: document.ngayhethan,
                vitri: document.vitri,
                congsuat: document.congsuat,
                model: document.model,
                dienap: document.dienap,
                mota: document.mota,
                lichsu: document.lichsu,
                maqr: document.maqr,
                maqrcochu: resultmaqrcochu
                
            }
            let result = await xulydongco.update_dongco(document.id ,docss)
            console.log('Success')
        }catch(e){
            console.log("Loi: ", document.id)
        }
    });
    res.send('make by thang khung the ki maqrcochu')
})
async function maqrcochu(docs) {
  try {
        const documents = docs
        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: 'No device documents found.' });
        }

        const docss = documents
        const defaultImagePath = path.join(__dirname, 'img', 'default-background.png');

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
        const deviceName = docss.tenthietbi || 'Tên thiết bị';
        const location = docss.vitri || 'Vị trí thiết bị';
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

        // Vẽ TÊN THIẾT BỊ (dòng trên)
        const fontSizeTop = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeTop}px Arial`;
        ctx.fillStyle = 'yellow';
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
async function guimailsuachuathang() {
  var daynow = moment().format('DD-MM-YYYY'); // Lấy ngày hiện tại, ví dụ: '20-10-2025'
    
    // 1. Lấy chuỗi "Tháng-Năm" hiện tại: 'MM-YYYY'
  var thangnamhientai = moment().format('MM-YYYY'); 
  // Kết quả cho tháng 10/2025 sẽ là: '10-2025'

  // 2. Xây dựng truy vấn dùng $regex
  // Mẫu regex: Khớp với bất kỳ chuỗi nào kết thúc bằng '-Thang-Nam' (ví dụ: '.*-10-2025')
  var query = {
      // "ngay": { 
      //     $regex: new RegExp(`-${thangnamhientai}$`) 
      // }
      "ngay": new RegExp(`-${thangnamhientai}$`) 
      // "ngay": "11-10-2025"
  };
  let result = await baotrisuachua.doc_suachua(query)
  // console.log(result)
  return (result)
  
}
router.put('/guimailsuachuathang', async (req, res) => {
  // let result = await guimailsuachuathang()
  let result = await guimailsuachuathangcocheckx()
  // maildinhky.sendmail(result)
  res.send(result)
}) 
async function guimailsuachuathangcocheckx() {
    // 1. Lấy chuỗi "Tháng-Năm" hiện tại và tháng trước
    
    // Ví dụ: Hôm nay 29/10/2025
    const thangnamhientai = moment().format('MM-YYYY'); 
    const thangnamthangtruoc = moment().subtract(1, 'months').format('MM-YYYY'); 
    
    // Xây dựng regex cho cả hai tháng
    const regexThangHienTaiVaTruoc = new RegExp(`-(${thangnamhientai}|${thangnamthangtruoc})$`);

    // 2. Xây dựng truy vấn để LỌC các bản ghi CHƯA được gửi mail ('check' != 'x')
    const query = {
        // Lọc theo trường "ngay" kết thúc bằng tháng hiện tại HOẶC tháng trước
        "ngay": {
            $regex: regexThangHienTaiVaTruoc
        },
        // Lọc các bản ghi CHƯA được đánh dấu 'x'
        "check": {
             $ne: 'x' 
        }
    };
    
    // Giả định hàm doc_suachua() của anh là một wrapper cho Model.find(query)
    // Hoặc anh có thể gọi trực tiếp: let listBaoTriChuaGui = await SuaChuaModel.find(query);
    let listBaoTriChuaGui = await baotrisuachua.doc_suachua(query); 
    
    
    // 3. Đánh dấu 'check' = 'x' cho tất cả các bản ghi vừa được lấy ra
    
    if (listBaoTriChuaGui && listBaoTriChuaGui.length > 0) {
        
        // Lấy ra danh sách các _id của bản ghi cần cập nhật
        const listIdsToUpdate = listBaoTriChuaGui.map(item => item._id);
        
        // Điều kiện cập nhật (tìm theo _id)
        const updateQuery = {
            _id: { $in: listIdsToUpdate } 
        };
        
        // Giá trị cần cập nhật (set 'check' = 'x')
        const updateOperation = {
            $set: { check: 'x' } 
        };

        // *** THỰC HIỆN CẬP NHẬT HÀNG LOẠT BẰNG MONGOOSE ***
        try {
            // Thay SuaChuaModel bằng tên Model Mongoose thực tế của anh
            const SuaChuaModel = baotrisuachua.model // Giả sử model được lưu trong object baotrisuachua
            // HOẶC dùng trực tiếp: 
            // const updateResult = await SuaChuaModel.updateMany(updateQuery, updateOperation).exec();
            
            // Giả định baotrisuachua có hàm update_many đã được custom:
            const updateResult = await baotrisuachua.update_many(updateQuery, updateOperation);
            
            console.log(`Đã đánh dấu 'check = x' cho ${updateResult.modifiedCount || updateResult.nModified || listIdsToUpdate.length} bản ghi.`);
        } catch (error) {
            console.error("Lỗi khi cập nhật trường 'check' bằng Mongoose:", error);
            // Tiếp tục trả về danh sách để gửi mail ngay cả khi đánh dấu bị lỗi (tùy vào yêu cầu nghiệp vụ)
        }
    } else {
        console.log("Không có bản ghi nào cần gửi mail trong tháng hiện tại và tháng trước.");
    }
    
    // 4. Trả về danh sách để module maildinhky.sendmail(result) xử lý gửi mail
    return listBaoTriChuaGui;
}
module.exports = router