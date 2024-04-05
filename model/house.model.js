const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    tencv: {type: String, required: true},
    vitricv: {type: String, required: false},
    ngaybatdau: {type: String, required: false},
    timehethan: {type: String, required: false},
    ngayketthuc: {type: String, require: false},
    ngayguimail: {type: String, require: false},
    ghichu: {type: String, required: false},
    songayhethan: {type: String, require: false}
})


module.exports = mongooge.model('house_cvdk', schema, 'house_cvdk')