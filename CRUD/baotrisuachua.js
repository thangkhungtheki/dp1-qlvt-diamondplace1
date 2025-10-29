const modembaotrisua = require("../model/baotrisuachua") // Đây là Mongoose Model

async function doc_suachua(query){
    let docs = await modembaotrisua.find(query)
    return docs
}


async function create_suachua(doc){
    try{
        await modembaotrisua.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function update_suachua(id, doc){
    
    try{
        await modembaotrisua.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}


async function delete_suachua (id){
    try {
        await modembaotrisua.findByIdAndDelete(id)
    } catch (e) {
        
    }
}

// Hàm mới: Dùng để cập nhật nhiều document cùng lúc (dùng trong logic đánh dấu check = 'x')
async function update_many(query, update) {
    try {
        // Sử dụng phương thức updateMany của Mongoose Model
        // 'query' là điều kiện lọc ({_id: {$in: [...]}}), 'update' là giá trị cần set ({{$set: {check: 'x'}}})
        const result = await modembaotrisua.updateMany(query, update);
        return result; 
    } catch (e) {
        console.error('Lỗi trong hàm update_many của module baotrisuachua:', e);
        throw e; // Ném lỗi để hàm gọi nó (guimailsuachuathang) có thể bắt
    }
}

module.exports = {
    doc_suachua,
    create_suachua,
    update_suachua,
    delete_suachua,
    update_many // Bổ sung hàm mới vào danh sách export
}