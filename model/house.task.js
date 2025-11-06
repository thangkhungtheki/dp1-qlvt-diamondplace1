const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    khuvuc: {type: String, required: false},
    vitri: {type: String, required: false},
    tencv: {type: String, required: false},
    ngaybatdau: {type: String, required: false},
    ngayketthuc: {type: String, required: false},
    motacongviec: {type: String, required: false},
    solanlam: {type: String, required: false},
    mota: {type: String, required: false},
    lichsucv: {type: String, required: false},
    thoigian: {type: String, required: false},
    songaynhacthongbao: {type: String, required: false},
    maqr: {type: String, require: false},
    maqrcochu: {type: String, require: false}
},
{
    timestamps: true // <--- THÊM DÒNG NÀY
})

module.exports = mongooge.model('housetask', schema, 'housetask')