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

module.exports = {
    sendmail
}