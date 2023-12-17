const _ycsc = require('../model/yeucausuachua.model')

async function taoyc(doc){
    try{
        await _ycsc.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function docyeucautheotrangthai(trangthai){
    try{
        let doc = await _ycsc.find({trangthai: trangthai})
        return doc
    }catch(e){
        return false
    }
}
module.exports = {
    taoyc,
    docyeucautheotrangthai,
}