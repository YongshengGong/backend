const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');
const app=express();
const jwt=require('jsonwebtoken');
const ECoItem=require('./ECommerceItemData');
const Slider=require('./ECommerceSlider');
const path = require('path');

require('dotenv').config();
const mongodbUsername=process.env.mongodbUsername;
const mongodbPassword=process.env.mongodbPassword;
console.log(mongodbUsername)
// const { json } = require('express')
// var router = express.Router();
// router.get('/123', function(req, res, next) {
//   res.json({
//     password:123,
//     username: 'MR peter666',
//     avatar: "https://i.pximg.net/img-master/img/2023/04/21/21/17/19/107386885_p1_master1200.jpg"
//   }); 
// });
// module.exports = router;

app.use(express.json());
app.use(cors());
// const users=[];
// app.use(express.urlencoded({extended:false}));

mongoose.connect(`mongodb+srv://${mongodbUsername}:${mongodbPassword}@cluster0.y9wrikk.mongodb.net/?retryWrites=true&w=majority`)
const userSchema = new mongoose.Schema({
  id:{type:String,unique:true},
  name:{type:String,required:true},
  password:{type:String,required:true,unique:true}
});

const User=mongoose.model('User',userSchema);

// console.log(User.collection.name)
const userCartSchema = new mongoose.Schema({
  username:{type:String,unique:true},
  product:{type:Array},
  quantity:{type:Array},
})
const Cart=mongoose.model('Cart',userCartSchema);

//*************************   ECommerceHomePage     ********************************/
app.use('/ECommercePicture', express.static(path.join(__dirname, 'ECommercePicture')));
app.get('/ECommerceHomePage',(req,res)=>{
  const page = req.query.page;
  const limit=req.query.limit;
  const index_start=page*limit-limit;
  const index_end=page*limit;
  let product;
  let totalPages;
  if(!req.query.search){
  product=ECoItem.slice(index_start,index_end);
  totalPages=Math.ceil((ECoItem.length)/limit);
  }
  else{
  product=ECoItem.filter(obj=>obj.name.toLowerCase().includes(req.query.search.toLocaleLowerCase())).slice(index_start,index_end);
  totalPages=Math.ceil((ECoItem.filter(obj=>obj.name.toLowerCase().includes(req.query.search.toLocaleLowerCase())).length)/limit);
  }
  
  res.json({totalPages,product});
})

app.get('/ECommerce_Slider',(req,res)=>{
  res.json({Slider});
}
)

app.post('/SaveToCart',async(req,res)=>{
  const cart=await Cart.findOne({username:req.body.username});
  try{
  if(!cart){
    const newCart=new Cart({
      username:req.body.username,
      product:[req.body.product],
      quantity:[req.body.addProductNumber]
    });
    await newCart.save();
  }

  else{
    cart.product.push(req.body.product);
    cart.quantity.push(req.body.addProductNumber);
    await cart.save();
  }
  res.status(201).json({message:'Cart has responsed'})
}
catch{
  res.status(500).json({message:'Cart Load Fails'})
}
console.log(req.body.product);
})

app.get('/Quantity',async(req,res)=>{
  const cart=await Cart.findOne({username:req.query.username});
  try{
   if(cart){
    const sum=cart.quantity.reduce((acc,num)=>acc+parseInt(num),0);//parseInt very important, because whatever comes out of the database is a string.
   res.json(sum);
   
   }
   else{
    res.json(0);
   }
  }
  catch{
    res.status(500).json({message:'Cart Load Fails'})
  }
})

app.get('/GetFromCart',async(req,res)=>{
  const cart=await Cart.findOne({username:req.query.username});
  if(cart){
    const product=cart.product;
    const quantity=cart.quantity;
    res.status(201).json({product,quantity});
    console.log(cart.product);
  }
})

app.post('/typeQuantity',async(req,res)=>{
  const cart=await Cart.findOne({username:req.query.username});
  if(cart){

  }
})

//*************************   Register using await    ********************************/
app.post('/Register',async(req,res)=>{
  const user=await User.findOne({name:req.body.userName});
  if(user){
    res.status(401).json({message:'User already exists!'})
  }
  else{
  try{
     const hashedPassword = await bcrypt.hash(req.body.password,10);
    //  users.push({
    //   id:Date.now().toString(),
    //   name:req.body.userName,
    //   password:hashedPassword,
    // })
     await User.create({
     id:Date.now().toString(),
      name:req.body.userName,
      password:hashedPassword
    });
    res.status(201).json({ message: "User registered successfullyFromBackEnd" });
    // res.json({test:"testing"});
  } 
  catch{
    res.status(500).json({ message: "Registration failedFromBackEnd" })
  }}
})
//*************************   Register  using .then()   ********************************/
// app.post('/Register', (req, res) => {
//   User.findOne({ name: req.body.userName })
//     .then(user => {
//       if (user) {
//         res.status(401).json({ message: 'User already exists!' });
//       } else {
//         bcrypt.hash(req.body.password, 10)
//           .then(hashedPassword => {
//             return User.create({
//               id: Date.now().toString(),
//               name: req.body.userName,
//               password: hashedPassword
//             })
//             .then(createdUser => {
//               res.status(201).json({ message: 'User registered successfullyFromBackEnd' });
//             })
//             .catch(error => {
//               res.status(500).json({ message: 'Registration failedFromBackEnd' });
//             });
//           })
//       }
//     })
//     .catch(error => {
//       res.status(500).json({ message: 'Registration failedFromBackEnd' });
//     });
// });


//*************************   LogIn     ********************************/
// app.post('/LogIn',async(req,res)=>{
//   const user=users.find(user=>user.name===req.body.userName);
//   try{
//      if(!user){
//       res.status(401).json({message:'用户不存在'});
//      }
//      else{
//      if(await bcrypt.compare(req.body.password,user.password)){
//       const token=jwt.sign({userName:user.name,expireTime:Date.now()+20000},'secretToken')
//       res.status(201).json({ message: "User login successfullyFromBackEnd",token});
//      }else{
//       res.status(401).json({message:"密码不正确"});
//      }
//     }
//   } 
//   catch{
//     res.status(500).json({ message: "User login failedFromBackEnd" })
//   }
// })
app.post('/LogIn',async(req,res)=>{
  const user=await User.findOne({name:req.body.userName});
  if(!user){
    res.status(401).json({message:'用户不存在'});
   }
   else{
  try{
     if(await bcrypt.compare(req.body.password,user.password)){
      const token=jwt.sign({userName:user.name,expireTime:Date.now()+1800000},'secretToken')
      res.status(201).json({ message: "User login successfullyFromBackEnd",token});
     }else{
      res.status(401).json({message:"密码不正确"});
     }
    }
  catch{
    res.status(500).json({ message: "User login failedFromBackEnd" })
  }}
})

app.listen(3001,()=>{console.log('good')});