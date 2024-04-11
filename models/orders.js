const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Orders = new Schema({
    order_code:{type:String},
    id_user:{type:Schema.Types.ObjectId,ref:'user'}
},{
    timestamps:true
})
module.exports= mongoose.model('Order',Orders);