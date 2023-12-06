const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    nguoiyeucau: {type: String, required: true},
    ngayyeucau: {type: String, required: false},
    bophan: {type: String, required: false},
    dienthoai: {type: String, required: false},
    vitri: {type: String, required: false},
    khancap: {type: String, required: false},
    mota: {type: String, required: false},
    trangthai: {type: String, required: false},
    motacongviec: {type: String, required: false},
    note: {type: String, required: false},
})


module.exports = mongooge.model('yeucausuachua', schema, 'yeucausuachua')