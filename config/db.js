const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const local ='mongodb://localhost:27017/Lab3_PD07826';
const atlat='mongodb+srv://admin:phuocdaica624@cluster0.on1mfeq.mongodb.net/Lab3_PD07826';
const connect = async()=>{
    try {
        await mongoose.connect(local,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        console.log('Kết nối thành công');    
    } catch (error) {
        console.log(error);
        console.log('Kết nối fail')   
    }
}
module.exports= {connect}