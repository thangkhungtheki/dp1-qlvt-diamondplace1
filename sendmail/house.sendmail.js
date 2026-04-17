const nodemailer = require('nodemailer')
var moment = require('moment')

// 🔥 group theo tuần/tháng/quý
function groupData(list) {
  return {
    tuan: list.filter(x => x.loai_dinh_ky === 'tuan'),
    thang: list.filter(x => x.loai_dinh_ky === 'thang'),
    quy: list.filter(x => x.loai_dinh_ky === 'quy')
  }
}

// 🔥 render từng block
function render(title, arr, color) {
  if (!arr.length) return ''

  let html = `
    <h3 style="color:${color}; border-bottom:1px solid ${color}; padding-bottom:5px;">
      ${title} (${arr.length})
    </h3>
  `

  arr.forEach(x => {

    let danger = x.songayhethan <= 1
      ? `<span style="color:red;font-weight:bold;">⚠ ${x.songayhethan} ngày</span>`
      : `<span style="color:#e67e22;">${x.songayhethan} ngày</span>`

    html += `
      <div style="margin-bottom:10px;">
        <b style="color:#2c3e50">${x.tencv}</b><br>
        📍 <span style="color:green">${x.vitricv || x.vitri}</span><br>
        ⏱ ${danger}
      </div>
    `
  })

  return html
}

// ======================= SEND MAIL NHẮC VIỆC =======================

function sendmail(data){

    var transporter = nodemailer.createTransport({
        host: process.env.HouseHostMail,
        port: process.env.HousePort,
        secure: true,
        auth: {
            user: process.env.HouseFrom,
            pass: process.env.HousePass,
        },
        tls: {
            rejectUnauthorized: false
        },
    });

    // 🔥 filter + sort
    let validData = data
      .filter(x => (x.songayhethan * 1) >= 0 && x.hoanthanh != 'yes')
      .sort((a, b) => a.songayhethan - b.songayhethan)

    // 🔥 group
    let grouped = groupData(validData)

    // 🔥 build html
    let html = ''

    html += render('📅 Công việc TUẦN', grouped.tuan, '#2980b9')
    html += render('📆 Công việc THÁNG', grouped.thang, '#27ae60')
    html += render('📊 Công việc QUÝ', grouped.quy, '#8e44ad')

    const daynow = moment().format('DD-MM-YYYY')

    if(html !== ''){

        html = `
        <h2 style="color:#2c3e50;">📢 Nhắc việc sắp đến hạn</h2>
        <p>Ngày: <b>${daynow}</b></p>
        <hr>
        ${html}
        `

        var mainOptions = { 
            from: process.env.HouseFrom,
            to: process.env.HouseEmailTo,
            subject: `[Nhắc việc] ${daynow}`,
            html: html
        }

        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
            } else {
                console.log('✅ Send mail thành công: ' + daynow);
            }
        });

    }else{
        console.log('Date: ' + daynow +' - Không có công việc')
    }
}


// ======================= SEND MAIL HOÀN THÀNH =======================

function sendMailComplete(taskData) {

    var transporter = nodemailer.createTransport({
        host: process.env.HouseHostMail,
        port: process.env.HousePort,
        secure: true,
        auth: {
            user: process.env.HouseFrom,
            pass: process.env.HousePass,
        },
        tls: {
            rejectUnauthorized: false
        },
    });

    try {
        const timeNow = moment().format('HH:mm DD-MM-YYYY');
        
        let htmlContent = `
            <h3 style="color: #2c3e50;">✅ Báo cáo hoàn thành công việc</h3>
            <p><b>Thời gian:</b> ${timeNow}</p>
            <p><b>Người thực hiện:</b> ${taskData.nguoithuchien}</p>
            <hr>
            
            <p><b>📌 Tên công việc:</b> 
            <span style="color: blue; font-size: 16px;">${taskData.tencv}</span></p>

            <p><b>🏢 Khu vực:</b> 
            <span style="color: #d35400;">${taskData.khuvuc}</span></p>

            <p><b>📍 Vị trí:</b> 
            <b>${taskData.vitri}</b> 
            ${taskData.phong ? `<i>(Chi tiết: ${taskData.phong})</i>` : ''}</p>
            
            <p><b>📝 Ghi chú:</b> ${taskData.noidung || 'Không có'}</p>
            <hr>
        `;

        let attachments = [];

        if (taskData.imgthuchien && Array.isArray(taskData.imgthuchien)) {
            htmlContent += `<p><b>📷 Hình ảnh:</b></p><div style="display:flex;flex-wrap:wrap;">`;

            taskData.imgthuchien.forEach((img, index) => {
                let cid = `img_${index}_${Date.now()}@house`;

                htmlContent += `<img src="cid:${cid}" style="max-width:250px;margin:5px;">`;

                attachments.push({
                    filename: `img_${index}.jpg`,
                    path: img.startsWith('data:image') ? img : 'data:image/jpeg;base64,' + img,
                    cid: cid
                });
            });

            htmlContent += `</div>`;
        }

        var mailOptions = {
            from: process.env.HouseFrom,
            to: process.env.HouseEmailTo,
            subject: `[Đã xong] ${taskData.nguoithuchien} - ${taskData.tencv}`,
            html: htmlContent,
            attachments: attachments
        }

        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.log('❌ Lỗi mail hoàn thành:', err);
            } else {
                console.log('✅ Đã gửi mail:', taskData.tencv);
            }
        });

    } catch (e) {
        console.log("❌ Lỗi sendMailComplete:", e);
    }
}

module.exports = {
    sendmail,
    sendMailComplete
}
