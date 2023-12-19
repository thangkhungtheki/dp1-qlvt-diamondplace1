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
        let doc = await _ycsc.find({ttbp: trangthai})
        return doc
    }catch(e){
        return false
    }
}

async function timyctheoma(ma){
    try{
        let doc = await _ycsc.find({mayeucau: ma})
        return doc
    }catch(e){
        return false
    }
}

async function updatetttbp(mayeucau, ttbp){
    try {
        await _ycsc.updateOne({mayeucau: mayeucau}, {$set:{ttbp: ttbp}})
    } catch (e) {
        console.log(e)
        return false
    }
}

async function deletettbp (ma) {
    try {
        await _ycsc.deleteOne({mayeucau: ma})
    } catch (e) {
        console.log(e)
        return false
    }
}
module.exports = {
    taoyc,
    docyeucautheotrangthai,
    updatetttbp,
    timyctheoma,
    deletettbp,
}