const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    mayeucau: {type: String, required: true},
    nguoiyeucau: {type: String, required: true},
    ngayyeucau: {type: String, required: true},
    bophan: {type: String, required: false},
    dienthoai: {type: String, required: false},
    vitri: {type: String, required: true},
    khancap: {type: String, required: false},
    mota: {type: String, required: true},
    trangthai: {type: String, required: false},
    motacongviec: {type: String, required: false},
    note: {type: String, required: false},
    filename: {type: String, required: false},
})


module.exports = mongooge.model('yeucausuachua', schema, 'yeucausuachua')