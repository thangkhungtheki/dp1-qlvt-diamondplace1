const _ycsc = require('../model/yeucausuachua.model')
const _file = require('../FileProcess/file')
//const _path = 'DP1-VATTU/DP1-Ver.Conect-DB-Node-login-use-schema/multer-upload/uploads/'
async function taoyc(doc){
    try{
        await _ycsc.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function docyeucautheotrangthai(trangthai, bophan){
    try{
        let doc = await _ycsc.find({ttbp: trangthai, bophan: bophan})
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

async function timyctheobophan(bp){
    try{
        let doc = await _ycsc.find({bophan: bp , ttbp: 'duyet'})
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
        let doc = await timyctheoma(ma)
        if(doc){
            doc[0].filename.forEach(file => {
                _file.xoafile(file.path)
            })
            await _ycsc.deleteOne({mayeucau: ma})

        }
        
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
    timyctheobophan,
}