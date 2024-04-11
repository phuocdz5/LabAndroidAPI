const express = require('express');
const router = express.Router();

const Distributors = require('../models/distributors');
const Fruits = require('../models/fruits');
const Upload = require('../config/common/upload');
const Users = require('../models/users');
const Transporter = require('../config/common/mail');
const JWT = require('jsonwebtoken');
const orders = require('../models/orders');
const SECRETKEY = 'phuocdz';

router.post('/add-distributor', async (req, res) => {
    try {
        const data = req.body;
        const newDistributors = new Distributors({
            name: data.name
        })
        const result = await newDistributors.save();
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Thêm không thành công",
                "data": []
            })
        }

    } catch (error) {
        console.log(error)
    }
})
router.post('/add-fruit', async (req, res) => {
    try {
        const data = req.body;
        const newFruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: data.image,
            desciption: data.desciption,
            id_distributor: data.id_distributor
        })
        const result = await newFruit.save();
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/get-fruit-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const data = await Fruits.findById(id).populate('id_distributor');
        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/get-list-fruit-in-price', async (req, res) => {
    try {
        const { price_start, price_end } = req.query

        const query = { price: { $gte: price_start, $lte: price_end } }

        const data = await Fruits.find(query, 'name quantity price id_distributor')
            .populate('id_distributor')
            .sort({ quantity: -1 })
            .skip(0)
            .limit(2)

        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/get-list-fruit-have-name-a-or-x', async (req, res) => {
    try {
        const query = {
            $or: [
                { name: { $regex: 'A' } },
                { name: { $regex: 'X' } },
            ]
        }

        const data = await Fruits.find(query, 'name quantity price id_distributor')
            .populate('id_distributor')

        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error)
    }
})


router.put('/update-fruit-by-id/:id', Upload.array('image', 5), async (req, res) => {
    try {
        const { id } = req.params
        const data = req.body;
        const { files } = req;



        let url1;
        const updatefruit = await Fruits.findById(id)
        if (files && files.length > 0) {
            url1 = files.map((file) => `http://localhost:3000/uploads/${file.filename}`);

        }
        if (url1 == null) {
            url1 = updatefruit.image;
        }

        let result = null;
        if (updatefruit) {
            updatefruit.name = data.name ?? updatefruit.name,
                updatefruit.quantity = data.quantity ?? updatefruit.quantity,
                updatefruit.price = data.price ?? updatefruit.price,
                updatefruit.status = data.status ?? updatefruit.status,


                updatefruit.image = url1,

                updatefruit.desciption = data.desciption ?? updatefruit.desciption,
                updatefruit.id_distributor = data.id_distributor ?? updatefruit.id_distributor,
                result = (await updatefruit.save()).populate("id_distributor");;
        }
        if (result) {
            res.json({
                'status': 200,
                'messenger': 'Cập nhật thành công',
                'data': result
            })
        } else {
            res.json({
                'status': 400,
                'messenger': 'Cập nhật không thành công',
                'data': []
            })
        }
    } catch (error) {
        console.log(error);
    }
})


// lab4
router.delete('/destroy-fruit-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await Fruits.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, xóa không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/add-fruit-with-file-image', Upload.array('image', 5), async (req, res) => {
    try {
        const data = req.body; // lấy dữ liệu từ body
        const { files } = req
        const urlsImage = files.map((file) => `http://localhost:3000/uploads/${file.filename}`)
        const newfruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: urlsImage,
            desciption: data.desciption,
            id_distributor: data.id_distributor
        });
        
        const result = (await newfruit.save()).populate("id_distributor"); // thêm dòng này
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/register-send-email', Upload.single('avatar'), async (req, res) => {
    try {
        const data = req.body;
        const { file } = req
        const newUser = Users({
            username: data.username,
            password: data.password,
            email: data.email,
            name: data.name,
            avatar: `http://localhost:3000/uploads/${file.filename}`,
            available: data.available
        })
        const result = await newUser.save()
        if (result) {   //Gửi mail
            const mailOptions = {
                from: "lynaxhai624@gmail.com", //email gửi đi
                to: result.email, // email nhận
                subject: "Đăng ký thành công", //subject
                text: "Cảm ơn bạn đã đăng ký", // nội dung mail
            };
            // Nếu thêm thành công result !null trả về dữ liệu
            await Transporter.sendMail(mailOptions); // gửi mail
            res.json({
                "status": 200,
                "messenger": "Đăng ký thành công",
                "data": result
            })
        } else {// Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, đăng ký không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username, password })
        if (user) {
            const token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
            const refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' })
            res.json({
                "status": 200,
                "messenger": "Đăng nhâp thành công",
                "data": user,
                "token": token,
                "refreshToken": refreshToken
            })
        } else {
            // Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Tài khoản hoặc mật khẩu không đúng",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//thêm từ 285 trở xuống 
router.get('/get-list-distributor', async (_req, res) => {
    try {
        const data = await Distributors.find().sort({ createdAt: -1 });
        if (data) {
            res.json({
                "status": 200,
                "messenger": "thành công",
                "data": data
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/search-distributors',async(req,res)=>{
    try {
        const key = req.query.key;

        const data = await Distributors.find({name:{"$regex":key, "$options":"i"}}).sort({createdAt:-1});
        if(data){
            res.json({
                "status":200,
                "messenger":"Thành công",
                "data":data
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Không thành công",
                "data":[]
            })
        }
    } catch (error) {
        console.log(error)
    }
})
router.delete('/delete-distributors/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await Distributors.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, xóa không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})
router.put('/update-distributors/:id', async(req,res)=>{
    try {
        const {id}=req.params;
        const data = req.body;
        const result = await Distributors.findByIdAndUpdate(id,{name:data.name});
        if(result){
            res.json({
                "status": 200,
                "messenger": "Sửa thành công",
                "data": result
            })
        }else{
            res.json({
                "status": 400,
                "messenger": "Lỗi, sửa không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/get-list-fruits', async (_req, res) => {
    try {
        const data = await Fruits.find().sort({ createdAt: -1 }).populate("id_distributor");
        if (data) {
            res.json({
                "status": 200,
                "messenger": "thành công",
                "data": data
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/get-page-fruit', async (req, res) => {
    // Auten
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)
    let payload;
    JWT.verify(token, SECRETKEY, (err, _payload) => {
        if(err instanceof JWT.TokenExpiredError) return res.sendStatus(401)
        if(err) return res.sendStatus(403)
        payload = _payload;
    })
    let perPage = 6; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.query.page || 1; // Page truyền lên
    let skip = (perPage * page) - perPage; // phân trang
    let count = await Fruits.find().count(); // Lấy tổng số phần tử
    // filltering
    // Lọc theo tên
    const name = {"$regex" : req.query.name ?? "", "$options": "i"}
    // Lọc giá lớn hơn hoặc bằng giá truyền vào
    const price = {$gte : req.query.price ?? 0}
    // Lọc sắp xếp theo giá
    const sort = {price : Number(req.query.sort) ?? 1}

    try {
        const data = await Fruits.find({name : name, price: price})
                                 .populate('id_distributor')
                                 .sort(sort)
                                 .skip(skip)
                                 .limit(perPage)
        res.json({
            "status" : 200,
            "messenger": "Danh sách fruit",
            "data" : {
                "data": data,
                "currentPage" : Number(page),
                "totalPage" : Math.ceil(count/perPage)
            }
        })
    } catch (error) {
        console.log(error);
    }

})
router.post("/add-order", async(req, res) => {
    try {
        const data = req.body;
        const newOrder = new orders({
            order_code: data.order_code,
            id_user: data.id_user
        })
        const result = await newOrder.save(); // add vao database
        if(result){
            // neu add successfuly result !null tra ve du lieu
            res.json({
                "status": 200,
                "messenger": "Thêm Thành công",
                "data": result
            })
        }else{
             // neu add fali result null, thông báo không thành công
             res.json({
                "status": 400,
                "messenger": "error, add fali",
                "data": null
            })
        }
    } catch (error) {
        console.log(error);
    }
})
module.exports = router