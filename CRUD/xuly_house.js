const housemodem = require('../model/house.model')

async function them(doc){
    //console.log(doc)
    try{
        await housemodem.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function xoa(param) {  }

async function sua() {

}

async function tim(){

}

module.exports = {
    them,
    xoa, 
    sua
}