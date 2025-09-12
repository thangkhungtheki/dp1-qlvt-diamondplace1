var express = require("express");
var router = express.Router();
var admin = require('firebase-admin');
var xulydongco = require('../CRUD/db.dongco')

const cookieParser = require('cookie-parser');

// Đường dẫn tới file Service Account Key của bạn
const serviceAccount = require('./key.json');
const { default: axios } = require("axios");

// Sử dụng middleware để parse cookies
router.use(cookieParser());
router.use(express.json());
// Khởi tạo Firebase Admin SDK một lần duy nhất trong ứng dụng
// Bạn nên đặt đoạn code này ở file chính (ví dụ: app.js hoặc index.js)
// để tránh khởi tạo nhiều lần
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  // Bỏ qua lỗi nếu app đã được khởi tạo
  // Firebase Admin SDK chỉ cho phép khởi tạo một lần
}


// --- Các Router API ---

// Hàm middleware để kiểm tra session cookie
const authenticateCookie = async (req, res, next) => {
  // Lấy session cookie từ request
  const sessionCookie = req.cookies.__session || '';

  // Kiểm tra xem có session cookie không
  if (!sessionCookie) {
    // Nếu không có, trả về lỗi hoặc chuyển hướng
    // return res.status(401).send('Unauthorized: No session cookie found.');
    return res.redirect('/app/views'); // Chuyển hướng về trang đăng nhập hoặc trang chính
  }

  // Xác thực session cookie bằng Firebase Admin SDK
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    // Lưu thông tin người dùng đã xác thực vào request
    req.user = decodedClaims;
    // console.log(req.user.email);
    next(); // Chuyển sang middleware hoặc route tiếp theo
  } catch (error) {
    // Nếu session cookie không hợp lệ hoặc đã hết hạn
    console.error('Lỗi khi xác thực session cookie:', error.message);
    // Xóa session cookie đã hết hạn
    res.clearCookie('__session');
    // Trả về lỗi
    // return res.status(401).send('Unauthorized: Invalid or expired session cookie.');
    return res.redirect('/app/views')
  }
};

// Route xử lý việc đăng nhập từ frontend và tạo session cookie
router.post('/sessionLogin', async (req, res) => {
  // Lấy ID token từ body của request
  const idToken = req.body.idToken;

  if (!idToken) {
    return res.status(400).send('Bad Request: ID token not provided.');
  }

  // Đặt thời gian hết hạn cho session cookie (ví dụ: 5 ngày)
  const expiresIn = 60 * 60 * 24 * 14 * 1000;

  try {
    // Tạo session cookie từ ID token
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Kiểm tra môi trường để quyết định đặt thuộc tính 'secure'
    // 'secure: true' chỉ hoạt động với HTTPS.
    // Đối với môi trường local (HTTP), nên đặt 'secure: false' hoặc bỏ qua.
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1' || req.hostname === '172.16.1.84';
    const cookieOptions = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: !isLocalhost,
    };
    
    // Thiết lập cookie trên response
    res.cookie('__session', sessionCookie, cookieOptions);
    // Trả về thành công
    res.send({ status: 'success' });
  } catch (error) {
    console.error('Lỗi khi tạo session cookie:', error.message);
    res.status(401).send('Unauthorized: Failed to create session cookie.');
  }
});

// Route đăng xuất
router.get('/sessionLogout', (req, res) => {
  // Xóa session cookie
  res.clearCookie('__session');
  res.redirect('/app/views'); // Chuyển hướng về trang đăng nhập hoặc trang chính
});

// API đăng ký người dùng mới bằng email và mật khẩu
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    console.log('Successfully created new user:', userRecord.uid);
    res.status(201).json({ 
      message: 'User created successfully', 
      uid: userRecord.uid, 
      email: userRecord.email 
    });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).json({ error: error.message });
  }
});

// API lấy thông tin người dùng dựa trên UID
router.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const userRecord = await admin.auth().getUser(uid);
    res.status(200).json(userRecord.toJSON());
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(404).json({ error: 'User not found.' });
  }
});
router.get('/views' , async (req, res)=>{
    return res.render('firebases/dangnhap')
})

// Route này sẽ render trang EJS với dữ liệu thiết bị
router.get('/qr-review/',authenticateCookie , async(req, res) => {
  var isIphone = req.isIphone;
  // console.log(isIphone)
  if(process.env.ENVDEV == 'true'){
    isIphone = true;  
  }
  const id = req.query.id;
  // Giả lập dữ liệu nhận được từ việc quét mã QR
  // Dữ liệu này có thể được gửi từ một API endpoint khác
  // let response = await xulydongco.timdongcotheoID('67ea3e1449626f0e8011aff5') 
  let response = await axios.get("https://files.diamondplace.org/dongco/dongcoapi?id=" + id)
  // console.log(response.data)
  var itemThietbi = {
   
  };
  var itemUser = await laythongtinuser(req.user);
  if(response.data){
    itemThietbi = {
      data: response.data,
      site: "Diamond Place I",
    }
    
  }else{
    response = await axios.get("https://app.diamondplace.org/dongco/dongcoapi?id=" + id)
    itemThietbi = {
      data: response.data,
      site: "Diamond Place II",
    }
  }
  
  // Render file EJS và truyền dữ liệu vào
  res.render('firebases/qr-review', { itemThietbi, itemUser , isIphone});
});
router.get('/webview', authenticateCookie , async(req, res) => {
  var isIphone = req.isIphone;
  if(process.env.ENVDEV == "true"){
    isIphone = true;
  }
  var itemUser = await laythongtinuser(req.user);
  res.render('firebases/qr-review', {
    itemThietbi: {} ,
    itemUser: itemUser,
    isIphone
  });
})

async function laythongtinuser(params) {
  var response1 = await axios.get('https://files.diamondplace.org/dongco/checkuser?email=' + params.email)
  if(response1.data.email){
    return response1.data;
  }else{
    var response2 = await axios.get('https://app.diamondplace.org/dongco/checkuser?email=' + params.email)
    if(response2.data.email){
      return response2.data;
    }else{
       return {
          ten: 'Unknown',
          congty: 'Unknown',
          phong: 'Unknown',
          email: 'Chưa add email vào hệ thống'
      };
    }
  }    
}
module.exports = router;
