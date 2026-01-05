const nodemailer = require('nodemailer')
var moment = require('moment')


 function sendmail(data){
    var sortData = data.sort((a, b) => a.songayhethan - b.songayhethan);
    var transporter =  nodemailer.createTransport({ // config mail server
        host: process.env.HouseHostMail,
        port: process.env.HousePort,
        type: 'login',
        secure: true,
        auth: {
            user: process.env.HouseFrom, //Tài khoản gmail vừa tạo
            pass: process.env.HousePass, //Mật khẩu tài khoản gmail vừa tạo
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
        
    });
    
    var text = ''
    for (let i = 0; i < sortData.length; i++) {
        
        if( (sortData[i].songayhethan * 1) >= 0 && (sortData[i].hoanthanh != 'yes') && sortData[i].flagguimail == "yes"){
           
            var string = '<b>.TênCV: ' + `</b><span style='color: blue'>` + sortData[i].tencv + ` </span>` + 
                            `Vị trí/Ngày thực hiện: ` + `<span style='color: green'>` + sortData[i].vitricv + `</span>` +
                            `<span>` + ` ngày đến hạn: </span>
                            <span style="color: red">` + sortData[i].songayhethan + `</span> ngày <br>
                            `
            // var string = data[i].tencv
            text = text + string
           
        }
        
         
    }
    // console.log(text)
    const daynow = moment().format('DD-MM-YYYY')
    if(text != ''){
        text = `Hôm nay ngày: `+ daynow + ` <br>` + text

        var mainOptions = { 
            from: process.env.HouseFrom,
            to: process.env.HouseEmailTo,
            
            subject: process.env.HouseSubject,
            
            html: text ,
            
        }
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
                return err
            } else {
                console.log('>>>house: Message sent: ' + daynow +  'send mail Success');
                return null
            }
        });

        // console.log('>>>sendmail: ', text)
    }else{
        
        
        console.log('Date: ' + daynow +'Ko có hết hạn')
        return null
    }

    
}
// Hàm 2: Gửi mail NGAY KHI hoàn thành công việc (Mới thêm)
function sendMailComplete(taskData) {
    
    var transporter =  nodemailer.createTransport({ // config mail server
        host: process.env.HouseHostMail,
        port: process.env.HousePort,
        type: 'login',
        secure: true,
        auth: {
            user: process.env.HouseFrom, //Tài khoản gmail vừa tạo
            pass: process.env.HousePass, //Mật khẩu tài khoản gmail vừa tạo
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
        
    });
    try {
        const timeNow = moment().format('HH:mm DD-MM-YYYY');
        
        // 1. Tạo nội dung HTML cơ bản
        let htmlContent = `
            <h3 style="color: #2c3e50;">Báo cáo hoàn thành công việc</h3>
            <p><b>Thời gian:</b> ${timeNow}</p>
            <p><b>Người thực hiện:</b> ${taskData.nguoithuchien}</p>
            <p><b>Tên công việc:</b> <span style="color: blue;">${taskData.tencv || 'Không xác định'}</span></p>
            <p><b>Vị trí:</b> ${taskData.phong || taskData.vitri || 'N/A'}</p>
            <p><b>Nội dung/Ghi chú:</b> ${taskData.noidung || 'Không có ghi chú'}</p>
            <hr>
        `;

        // 2. Xử lý hình ảnh (Có ảnh hoặc không ảnh đều chạy được)
        if (taskData.imgthuchien && Array.isArray(taskData.imgthuchien) && taskData.imgthuchien.length > 0) {
            htmlContent += `<p><b>Hình ảnh thực tế:</b></p> <div style="display: flex; flex-wrap: wrap;">`;
            
            taskData.imgthuchien.forEach(img => {
                // Kiểm tra xem ảnh có prefix base64 chưa, nếu chưa thì thêm vào
                let src = img
                
                // Thêm thẻ img vào HTML (giới hạn chiều rộng để không vỡ mail)
                htmlContent += `<img src="${src}" style="max-width: 300px; height: auto; margin: 5px; border: 1px solid #ddd;" />`;
            });
            
            htmlContent += `</div>`;
        } else {
            htmlContent += `<p><i>(Công việc này không có hình ảnh đính kèm)</i></p>`;
        }

        // 3. Cấu hình gửi mail
        var mailOptions = {
            from: process.env.HouseFrom,
            to: process.env.HouseEmailTo, // Gửi về cho quản lý
            subject: `[Đã xong] ${taskData.nguoithuchien} vừa hoàn thành: ${taskData.tencv}`, // Tiêu đề động
            html: htmlContent,
        }

        // 4. Thực hiện gửi
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.log('❌ Lỗi gửi mail hoàn thành:', err);
            } else {
                console.log('✅ Đã gửi mail báo cáo hoàn thành: ' + taskData.tencv);
            }
        });

    } catch (e) {
        console.log("Lỗi logic sendMailComplete:", e);
    }
}
module.exports = {
    sendmail,
    sendMailComplete
}