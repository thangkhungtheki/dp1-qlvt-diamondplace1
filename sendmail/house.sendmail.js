const nodemailer = require('nodemailer')
var moment = require('moment')


function sendmail(data){

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
    var text = ``
    for (let i = 0; i < data.length; i++) {
        
        if( data[i].songayhethan <= 30 && data[i].songayhethan > 0 ){
            
            var string = '<b>.Tên: ' + `</b><span style='color: blue'>` + data[i].tentb + ` </span>
                            <span>` + ` ---day: </span>
                            <span style="color: red">` + data[i].songayhethan + ` ngày </span> <br>`
            text = text + string
           
        }
        
         
    }
    
    if(text != ''){
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: process.env.HouseFrom,
            to: process.env.HouseEmailTo,
            //bcc: 'it@diamondplace.com.vn',
            subject: process.env.HouseSubject,
            //text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
            html: text ,//Nội dung html mình đã tạo trên kia :)),
            
        }
    
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
                return err
            } else {
                console.log('Message sent: ' +  'send mail Success');
                return null
            }
        });
    }else{
        
        let daynow = moment().format('dd/MM/YYYY')
        console.log('Date: ' + daynow +'Ko có hết hạn')
        // content = 'test mail'
        // var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        //     from: process.env.emailFrom,
        //     to: process.env.mailList,
        //     //bcc: 'it@diamondplace.com.vn',
        //     subject: process.env.subject,
        //     //text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
        //     html: content ,//Nội dung html mình đã tạo trên kia :)),
            
        // }
        // transporter.sendMail(mainOptions, function(err, info){
        //     if (err) {
        //         console.log(err);
                
        //     } else {
        //         console.log('Message sent: ' +  info.response);
        //     }
        // });
    }

    
}

module.exports = {
    sendmail
}