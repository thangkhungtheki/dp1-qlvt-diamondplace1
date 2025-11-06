const modemhousetask = require("../model/house.task") // Đây là Mongoose Model

async function docs(query){
    let docs = await modemhousetask.find(query)
    return docs
}


async function create(doc){
    try{
        await modemhousetask.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function update(id, doc){
    
    try{
        await modemhousetask.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}


async function deletes (id){
    try {
        await modemhousetask.findByIdAndDelete(id)
    } catch (e) {
        
    }
}

// Hàm mới: Dùng để cập nhật nhiều document cùng lúc (dùng trong logic đánh dấu check = 'x')
async function update_many(query, update) {
    try {
        // Sử dụng phương thức updateMany của Mongoose Model
        // 'query' là điều kiện lọc ({_id: {$in: [...]}}), 'update' là giá trị cần set ({{$set: {check: 'x'}}})
        const result = await modemhousetask.updateMany(query, update);
        return result; 
    } catch (e) {
        console.error('Lỗi trong hàm update_many của module baotrisuachua:', e);
        throw e; // Ném lỗi để hàm gọi nó (guimailsuachuathang) có thể bắt
    }
}

module.exports = {
    docs,
    create,
    update,
    deletes,
    update_many // Bổ sung hàm mới vào danh sách export
}