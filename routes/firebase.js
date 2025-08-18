var express = require("express");
var router = express.Router();
var admin = require('firebase-admin');
var xulydongco = require('../CRUD/db.dongco')

// Đường dẫn tới file Service Account Key của bạn
const serviceAccount = require('./key.json');
const { default: axios } = require("axios");

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
router.post('/login', async (req, res) => {
  const email = 'nguyenduytan17@gmail.com'
  if (!email) {
    return res.status(400).json({ error: 'Email là bắt buộc.' });
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Tạo một Custom Token để gửi về cho frontend
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    res.status(200).json({ customToken });
    
  } catch (error) {
    // Xử lý các lỗi từ Firebase
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Không tìm thấy người dùng với email này.' });
    }
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
  }
});
// Route này sẽ render trang EJS với dữ liệu thiết bị
router.get('/qr-review/', async(req, res) => {
  const id = req.query.id;
  // Giả lập dữ liệu nhận được từ việc quét mã QR
  // Dữ liệu này có thể được gửi từ một API endpoint khác
  // let response = await xulydongco.timdongcotheoID('67ea3e1449626f0e8011aff5') 
  let response = await axios.get("https://files.diamondplace.org/dongco/dongcoapi?id=" + id)
  // console.log(response.data)
  var itemThietbi = {
   
  };
  var itemUser = {
   
  };
  if(response.data){
    itemThietbi = response.data
    itemUser = {
    ten: 'Nguyễn Văn A',
    congty: 'Diamondplace 1',
    phong: 'KYTHUAT',
    email: 'nguyenvana@example.com'
    }
  }else{
    response = await axios.get("https://app.diamondplace.org/dongco/dongcoapi?id=" + id)
    itemThietbi = response.data
    itemUser = {
    ten: 'Nguyễn Văn A',
    congty: 'Diamondplace 2',
    phong: 'KYTHUAT',
    email: 'nguyenvana@example.com'
    }
  }
  
  // Render file EJS và truyền dữ liệu vào
  res.render('firebases/qr-review', { itemThietbi, itemUser });
});
router.get('/webview', (req, res) => {
  res.render('firebases/qr-review', {
    itemThietbi: {} ,
    itemUser: {
      ten: 'Nguyễn Văn B',
      congty: 'Diamondplace',
      phong: 'KYTHUAT',
      email: ''
    }
  });
})

module.exports = router;
