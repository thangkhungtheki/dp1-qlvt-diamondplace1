const _ycsc = require('../model/yeucausuachua.model')

async function taoyc(doc){
    try{
        await _ycsc.create(doc)
        return true
    }catch(e){
        return false
    }
}

module.exports = {
    taoyc,
}