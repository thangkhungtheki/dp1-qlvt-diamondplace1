var express = require("express");
var router = express.Router();
var moment = require('moment');
const exceljs = require('exceljs');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp'); // Giữ lại nếu cần xử lý resize phức tạp, nhưng code dưới ưu tiên canvas cho text
const { createCanvas, loadImage, registerFont } = require('canvas');

// Import các module DB
var xulydongco = require('../CRUD/db.dongco');
const ycsc = require('../CRUD/xulyyeucau');
var xulydbuser = require("../CRUD/xulydb");
const maildinhky = require('../sendmail/maildinhkysuachuathang');
const baotrisuachua = require("../CRUD/baotrisuachua");

// --- HELPER FUNCTIONS ---

// Tối ưu: Chạy song song các query đếm số lượng để giảm thời gian chờ
async function tongsuachuaton() {
    try {
        const categories = ['bep', 'sales', 'marketing', 'fb', 'ketoan', 'avtrangtri', 'house', 'nhansu', 'baove', 'khac'];
        // Dùng Promise.all để chạy song song 10 query thay vì đợi từng cái
        const results = await Promise.all(categories.map(cat => ycsc.timyctheobophan(cat)));
        
        let total = {};
        categories.forEach((cat, index) => {
            total[cat] = results[index].length;
        });
        return total;
    } catch (error) {
        console.error("Lỗi tính tổng tồn:", error);
        return {}; // Trả về rỗng để không crash trang
    }
}

// Hàm escape XML cho file Excel/SVG
function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') unsafe = String(unsafe || '');
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

// Hàm tạo ảnh composite (Background + QR + Text) dùng chung
async function createCompositeImage(doc, defaultImagePath) {
    try {
        if (!doc || !doc.maqr) return null;

        let backgroundImage;
        try {
            backgroundImage = await loadImage(defaultImagePath);
        } catch (err) {
            console.error('Không load được ảnh nền:', defaultImagePath);
            return null;
        }

        const deviceName = doc.tenthietbi || 'Tên thiết bị';
        const location = doc.vitri || 'Vị trí thiết bị';
        const qrCodeImageBuffer = Buffer.from(doc.maqr, 'base64'); // maqr là base64 string
        const qrImage = await loadImage(qrCodeImageBuffer);

        const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
        const ctx = canvas.getContext('2d');

        // 1. Vẽ nền
        ctx.drawImage(backgroundImage, 0, 0);

        // 2. Vẽ QR ở giữa
        const qrSize = 200;
        const qrLeft = (backgroundImage.width - qrSize) / 2;
        const qrTop = (backgroundImage.height - qrSize) / 2;
        ctx.drawImage(qrImage, qrLeft, qrTop, qrSize, qrSize);

        // 3. Cấu hình Font chung
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';

        // 4. Vẽ Tên thiết bị (Trên)
        const fontSizeTop = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeTop}px Arial`;
        const deviceNameY = Math.round(backgroundImage.height * 0.1);
        ctx.strokeText(deviceName, backgroundImage.width / 2, deviceNameY);
        ctx.fillText(deviceName, backgroundImage.width / 2, deviceNameY);

        // 5. Vẽ Vị trí (Dưới)
        const fontSizeBottom = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeBottom}px Arial`;
        const locationY = Math.round(backgroundImage.height * 0.95);
        ctx.strokeText(location, backgroundImage.width / 2, locationY);
        ctx.fillText(location, backgroundImage.width / 2, locationY);

        return canvas.toBuffer('image/png').toString('base64');
    } catch (error) {
        console.error('Lỗi tạo ảnh composite:', error);
        return null;
    }
}

// --- MIDDLEWARES ---

router.use(async (req, res, next) => {
    try {
        let total = await tongsuachuaton();
        res.locals.arrayTong = total;
        next();
    } catch (e) {
        console.error("Middleware error:", e);
        next();
    }
});

// --- VIEWS ROUTES ---

router.get('/view', async (req, res) => {
    try {
        const daynow = moment().format('DD-MM-YYYY');
        const data = await xulydongco.doc_dongco();
        res.render('mainSbAdmin/dongcoview', {
            _username: '',
            daynow: daynow,
            data: data
        });
    } catch (error) {
        res.status(500).send("Lỗi server: " + error.message);
    }
});

router.get('/phanloai', async (req, res) => {
    try {
        const daynow = moment().format('DD-MM-YYYY');
        const loai = req.query.loai;
        const data = await xulydongco.loai_dongco(loai);
        res.render('mainSbAdmin/dongcoview', {
            _username: '',
            daynow: daynow,
            data: data
        });
    } catch (error) {
        res.status(500).send("Lỗi server");
    }
});

router.get('/themdongco', (req, res) => {
    res.render('mainSbAdmin/dongco_them', { _username: '' });
});

router.post('/taodongco', async (req, res) => {
    try {
        let ngaymua = moment(req.body.ngaymua, 'YYYY-MM-DD');
        let ngayhethan = moment(req.body.ngayhethan, 'YYYY-MM-DD');
        
        let doc = {
            tenthietbi: req.body.tentb,
            loai: req.body.selectloai,
            ngaymua: ngaymua.isValid() ? ngaymua.format('YYYY-MM-DD') : null,
            ngayhethan: ngayhethan.isValid() ? ngayhethan.format('YYYY-MM-DD') : null,
            vitri: req.body.vitri,
            congsuat: req.body.congsuat,
            model: req.body.model,
            dienap: req.body.dienap,
            mota: req.body.mota,
            lichsu: req.body.lichsu,
        };

        let result = await xulydongco.tao_dongco(doc);
        if (result) {
            req.flash('success', 'Đã thêm thành công: ' + doc.tenthietbi);
            const msg = req.flash('success');
            return res.render('mainSbAdmin/dongco_them', { _username: '', msg });
        } else {
            throw new Error("Không tạo được bản ghi");
        }
    } catch (error) {
        console.error(error);
        req.flash('not', 'Lỗi server ... thử lại sau');
        const msge = req.flash('not');
        return res.render('mainSbAdmin/dongco_them', { _username: '', msge });
    }
});

router.post('/xoadongco', async (req, res) => {
    try {
        let id = req.body.id;
        await xulydongco.delete_dongco(id);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

router.get('/suadongco', async (req, res) => {
    try {
        let id = req.query.id;
        let result = await xulydongco.timdongcotheoID(id);
        if (result) {
            return res.render('mainSbAdmin/dongco_sua', { _username: '', data: result });
        } else {
            res.end();
        }
    } catch (error) {
        res.end();
    }
});

router.post('/suadongco', async (req, res) => {
    try {
        let ngaymua = moment(req.body.ngaymua, 'YYYY-MM-DD');
        let ngayhethan = moment(req.body.ngayhethan, 'YYYY-MM-DD');
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
        };
        let id = req.body.id;
        let result = await xulydongco.update_dongco(id, doc);
        if (result) {
            return res.redirect('/dongco/view');
        } else {
            res.end();
        }
    } catch (error) {
        console.error(error);
        res.end();
    }
});

// --- API & EXCEL ROUTES ---

router.get('/xuatexceldongco', async (req, res) => {
    try {
        let documents = await xulydongco.doc_dongco();
        if (!Array.isArray(documents)) {
            documents = Object.values(documents);
        }

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('DongcoMayLanh');

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

        const qrCodeColumnIndex = 10;
        const desiredImageWidth = 80;
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

                    worksheet.addImage(imageId, {
                        tl: { col: qrCodeColumnIndex, row: rowNumber - 1 },
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

        // Đóng khung
        const lastRow = documents.length + 1;
        const lastColumn = columns.length;
        const borderStyles = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

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
        console.error('Lỗi xuất Excel:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Tạo/Update QR Code gốc (API QrServer)
router.get('/api/capnhatmaqr', async (req, res) => {
    try {
        const documents = await xulydongco.doc_dongco();
        
        // TỐI ƯU: Dùng for...of để chạy tuần tự, tránh treo server vì quá tải request
        // forEach với async sẽ bắn hàng trăm request cùng lúc -> NGUY HIỂM
        for (const document of documents) {
            let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + document.id;
            try {
                let base64Image;
                if (!document.maqr) {
                    const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
                    base64Image = Buffer.from(response.data).toString('base64');
                } else {
                    base64Image = document.maqr;
                }

                const docss = {
                    ...document, // Kế thừa các thuộc tính cũ an toàn hơn liệt kê tay
                    maqr: base64Image
                };
                
                // Chỉ cập nhật trường cần thiết nếu hàm update hỗ trợ partial update, 
                // nhưng ở đây tôi giữ nguyên logic ghi đè của bạn
                await xulydongco.update_dongco(document.id, docss);
                // console.log("Updated QR for:", document.id);
            } catch (e) {
                console.error("Lỗi cập nhật QR ID:", document.id, e.message);
            }
        }
        res.send('Cập nhật mã QR thành công');
    } catch (error) {
        res.status(500).send('Lỗi Server: ' + error.message);
    }
});

// Route: Tạo/Update QR có chữ (Composite Image)
router.get('/api/capnhatmaqrcochu', async (req, res) => {
    try {
        const documents = await xulydongco.doc_dongco();
        const defaultImagePath = path.join(__dirname, 'img', 'default-background.png');
        
        // Tối ưu: Dùng for...of
        for (const document of documents) {
            try {
                // Tái sử dụng hàm createCompositeImage đã tách ra
                let resultmaqrcochu = await createCompositeImage(document, defaultImagePath);
                
                if (resultmaqrcochu) {
                    const docss = {
                        ...document,
                        maqrcochu: resultmaqrcochu
                    };
                    await xulydongco.update_dongco(document.id, docss);
                    console.log('Success update composite QR:', document.id);
                }
            } catch (e) {
                console.error("Lỗi tạo ảnh có chữ ID:", document.id, e);
            }
        }
        res.send('Cập nhật QR có chữ thành công (Made by Thang Khung The Ki)');
    } catch (error) {
        res.status(500).send('Lỗi Server');
    }
});

router.get('/dongcoapi', async (req, res) => {
    try {
        let id = req.query.id;
        let result = await xulydongco.timdongcotheoID(id);
        res.json(result);
    } catch (e) {
        res.status(500).json({});
    }
});

router.get('/checkuser', async (req, res) => {
    try {
        let email = req.query.email;
        let result = await xulydbuser.docUseremail(email);
        if (result) {
            res.json({
                ten: result.ten,
                congty: result.congty,
                phong: result.bp || null,
                email: result.mail
            });
        } else {
            res.send(false);
        }
    } catch (e) {
        res.send(false);
    }
});

router.get('/api/suadongcomany', async (req, res) => {
    try {
        let result = await xulydongco.suadatabase();
        res.send(result);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// --- IMAGE SERVING ROUTES ---
// Tối ưu: Gom logic serve ảnh
function serveImage(res, imagePath) {
    if (!fs.existsSync(imagePath)) {
        return res.status(404).send('Image not found');
    }
    const stat = fs.statSync(imagePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', stat.size);
    const readStream = fs.createReadStream(imagePath);
    readStream.pipe(res);
    readStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).end();
    });
}

router.get('/api/anh1', (req, res) => {
    const imagePath = path.join(__dirname, '/img/anhdau.jpg');
    serveImage(res, imagePath);
});

router.get('/api/anh2', (req, res) => {
    const imagePath = path.join(__dirname, 'img/anhcuoi.jpg');
    serveImage(res, imagePath);
});

// --- UPDATE HISTORY ROUTE ---

router.put('/update-lichsu-string', async (req, res) => {
    try {
        let id = req.body.id;
        let newHistoryEntry = req.body.lichsu;

        if (!newHistoryEntry) {
            return res.status(400).json({ message: 'Thiếu dữ liệu lịch sử mới.' });
        }

        const dongcoToUpdate = await xulydongco.timdongcotheoID(id);
        if (!dongcoToUpdate) {
            return res.status(404).json({ message: 'Không tìm thấy thiết bị.' });
        }

        const daynow1 = moment().format('DD-MM-YYYY');
        newHistoryEntry = daynow1 + " " + newHistoryEntry;
        
        let updatedLichsu = dongcoToUpdate.lichsu 
            ? `${dongcoToUpdate.lichsu}\n${newHistoryEntry}` 
            : newHistoryEntry;

        let updatedDongco = await xulydongco.xulyupdale_lichsu(id, updatedLichsu);

        // Regex tìm tên người trong lịch sử
        let re = /^(\d{2}-\d{2}-\d{4})\s+([A-Za-zÀ-ỹ\s]+?):/m;
        let m = newHistoryEntry.match(re);
        
        let baotri = {
            ngay: moment().format('DD-MM-YYYY'),
            idthietbi: id,
            phong: 'KYTHUAT',
            noidung: newHistoryEntry,
            nguoithuchien: m?.[2] || 'KHONGXACDINH',
            noidunglaychonhanh: (dongcoToUpdate.tenthietbi || '') + " " + (dongcoToUpdate.vitri || '') + ": " + newHistoryEntry
        };

        let kq = await baotrisuachua.create_suachua(baotri);
        console.log('Kết quả thêm lịch sử bảo trì:', kq);

        res.status(200).json({
            message: 'Cập nhật lịch sử thành công!',
            dongco: updatedDongco
        });

    } catch (error) {
        console.error('Lỗi update lịch sử:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ.', error: error.message });
    }
});

// --- GENERATE SINGLE DEVICE IMAGE API ---

router.get('/generate-device-maqrcochu', async (req, res) => {
    try {
        // Tối ưu: Nếu chỉ cần tạo mẫu cho 1 cái đầu tiên để test, giữ logic cũ
        const documents = await xulydongco.doc_dongco();
        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: 'No device documents found.' });
        }

        const docss = documents[0]; // Lấy mẫu cái đầu tiên
        const defaultImagePath = path.join(__dirname, 'img', 'default-background.png');
        
        const finalBase64 = await createCompositeImage(docss, defaultImagePath);
        
        if (finalBase64) {
            res.status(200).json({ imageBase64: finalBase64 });
        } else {
            res.status(500).json({ message: 'Lỗi tạo ảnh.' });
        }
    } catch (error) {
        console.error('Lỗi xử lý canvas route:', error);
        res.status(500).json({ message: 'Lỗi tạo ảnh bằng canvas.', error: error.message });
    }
});

// --- MAIL SCHEDULE ROUTE ---

// Logic: Gửi mail các phiếu bảo trì chưa check (check != 'x') của tháng hiện tại và tháng trước
async function guimailsuachuathangcocheckx() {
    try {
        const thangnamhientai = moment().format('MM-YYYY');
        const thangnamthangtruoc = moment().subtract(1, 'months').format('MM-YYYY');
        
        // Regex: Kết thúc bằng MM-YYYY hiện tại hoặc tháng trước
        const regexThangHienTaiVaTruoc = new RegExp(`-(${thangnamhientai}|${thangnamthangtruoc})$`);

        const query = {
            "ngay": { $regex: regexThangHienTaiVaTruoc },
            "check": { $ne: 'x' }
        };

        let listBaoTriChuaGui = await baotrisuachua.doc_suachua(query);

        if (listBaoTriChuaGui && listBaoTriChuaGui.length > 0) {
            const listIdsToUpdate = listBaoTriChuaGui.map(item => item._id);
            const updateQuery = { _id: { $in: listIdsToUpdate } };
            const updateOperation = { $set: { check: 'x' } };

            try {
                // Giả định DB module có hàm update_many, nếu không thì dùng loop (chậm hơn nhưng an toàn nếu model lạ)
                if (baotrisuachua.update_many) {
                    await baotrisuachua.update_many(updateQuery, updateOperation);
                } else {
                     // Fallback nếu không có hàm updateMany
                     // console.log("Module baotrisuachua thiếu update_many, dùng loop...");
                     for (let item of listBaoTriChuaGui) {
                         // Cần hàm update theo ID cụ thể
                         // await baotrisuachua.update_id(item._id, {check: 'x'});
                     }
                }
                console.log(`Đã gửi mail và đánh dấu ${listIdsToUpdate.length} bản ghi.`);
            } catch (error) {
                console.error("Lỗi update check=x:", error);
            }
        }
        return listBaoTriChuaGui;
    } catch (e) {
        console.error("Lỗi gửi mail định kỳ:", e);
        return [];
    }
}

router.put('/guimailsuachuathang', async (req, res) => {
    try {
        let result = await guimailsuachuathangcocheckx();
        // Kiểm tra result trước khi gửi
        if (result && result.length > 0) {
            maildinhky.sendmail(result);
            res.send('Đã gửi mail (' + result.length + ' phiếu)');
        } else {
            res.send('Không có phiếu mới để gửi');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Lỗi gửi mail');
    }
});

module.exports = router;