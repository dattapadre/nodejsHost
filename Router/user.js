const express = require("express");
const route = express.Router();
const exe = require("./../connection");
const url = require("url"); //  npm i url

route.get("/", async function (req, res) {
  var data = await exe(`SELECT * FROM about_company`);
  var slider = await exe(`SELECT * FROM slider`);

  var obj = { about_company: data, slider: slider,"is_login":verifyaccount(req) };

  res.render("user/index.ejs", obj);
});

route.get("/about", async function (req, res) {
  var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data ,"is_login":verifyaccount(req) };
  res.render("user/about.ejs", obj);
});

route.get("/shop", async function (req, res) {
    
  var url_data = url.parse(req.url, true).query;

  var cond = "";

  if (url_data.categary_id) {
    cond = `WHERE categary_id = '${url_data.categary_id}'`;
  }

  if (url_data.color) {
    cond = `WHERE product_colors = '${url_data.color}'`;
  }

  if (url_data.company) {
    cond = `WHERE product_company = '${url_data.company}'`;
  }

  if (url_data.product_name) {
    cond = `WHERE product_name LIKE '%${url_data.product_name}%'`;
  }

  var data = await exe(`SELECT * FROM about_company`);
  var categary = await exe(`SELECT * FROM categary`);
  var company = await exe(
    ` SELECT product_company FROM product GROUP BY  product_company`
  );
  var color = await exe(
    `SELECT product_colors FROM product GROUP BY product_colors`
  );

  var sql =
    `SELECT * ,
       (SELECT MIN(product_price) FROM product_pricing 
       WHERE product.product_id = product_pricing.product_id 
       AND  product_price > 0 ) AS  price ,

       (SELECT MAX(product_duplicate_price) FROM product_pricing 
       WHERE product.product_id = product_pricing.product_id 
       AND  product_duplicate_price > 0 ) AS  product_duplicate_price   
       FROM product ` + cond;

  //    res.send(sql)
  var product = await exe(sql);

  var obj = {
    about_company: data,
    categary: categary,
    company_name: company,
    colors: color,
    product: product,
    "is_login":verifyaccount(req)  
  };
  res.render("user/shop.ejs", obj);
});


route.get("/blog", async function (req, res) {
  var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data,"is_login":verifyaccount(req) };
  res.render("user/blog.ejs", obj);
});

route.get("/contact", async function (req, res) {
  var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data,"is_login":verifyaccount(req) };
  res.render("user/contact.ejs", obj);
});

route.get("/view_product/:id", async function(req,res){
  var  id = req.params.id;
  var product = await exe(`SELECT * FROM product WHERE product_id = '${id}'`);
  var price = await exe(`SELECT * FROM product_pricing WHERE product_id = '${id}'`);
    var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data ,"product_info":product,"price":price,"is_login":verifyaccount(req)};
  res.render("user/view_product.ejs",obj)
})

route.get("/login",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data ,"is_login":verifyaccount(req)  };
  res.render("user/login.ejs",obj)
})

route.post("/do_login", async function(req,res){
  var d = req.body;
  var sql = `SELECT * FROM users WHERE user_mobile = '${d.user_mobile}' AND password = '${d.password}'`
  var data = await exe(sql);

  if(data.length >0 ){
    req.session.user_id = data[0].user_id;
    console.log("user_id",req.session.user_id)
    res.redirect("/shop")
  }else{
    res.send("INvalid Password");
  }
})


function verifyaccount(req,res,next){

  // req.session.user_id = 4; 

   var user_id = req.session.user_id;

   if(user_id == undefined){
    return false;
    // res.redirect("/login")
   }else{
    return true;
   }

}

route.get("/create_account",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data,"is_login":verifyaccount(req) };
  res.render("user/new_account.ejs",obj)
})

route.post("/create_account", async function(req,res){
  var d = req.body;
  var sql = ` INSERT INTO users(user_name ,user_mobile ,user_email , password) VALUES
  (?,?,?,?)`
  
  var data = await exe(sql,[d.user_name , d.user_mobile ,d.user_email , d.password])

  res.redirect("/login")
})


route.get("/logout",function(req,res){
  req.session.user_id = undefined;
  res.redirect("/")
})


route.get("/add_to_cart/:product_id/:product_pricing_id",async function(req,res){
  var product_princing_id = req.params.product_pricing_id;
  var product_id = req.params.product_id;
  var user_id = req.session.user_id;

  var sql = ` INSERT INTO cart (product_id ,product_pricing_id,user_id ,qty) VALUES ('${product_id}','${product_princing_id}','${user_id}',1)`
  var data = await exe(sql);

  if(req.session.user_id){
  res.redirect('/shop')
  }else{
    res.redirect("/login");
  }

  // res.send(sql)

})

route.get("/cart",async function(req,res){

  var sql = `SELECT * FROM product ,product_pricing , cart 
  WHERE 
  product.product_id =  product_pricing.product_id 
  AND 
  product_pricing.product_pricing_id  = cart.product_pricing_id
  AND 
  product.product_id  = cart.product_id 
  AND 
  cart.user_id = '${req.session.user_id}'`;

  var cart = await exe(sql)

    var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data,"is_login":verifyaccount(req) ,"cart":cart};
  res.render("user/cart.ejs",obj)
})


route.get("/qtyincrease/:cart_id",async function(req,res){
  var cart_id = req.params.cart_id;

  var sql = `UPDATE cart SET qty = qty+1 WHERE cart_id = '${cart_id}'`;

  var data = await exe(sql);

  res.redirect('/cart')
})

route.get("/decrease/:cart_id",async function(req,res){
  var cart_id = req.params.cart_id;

  var sql = `UPDATE cart SET qty = qty-1 WHERE cart_id = '${cart_id}'`;

  var data = await exe(sql);

  res.redirect('/cart')
})

route.get("/checkout", async function(req,res){

  var sql = `SELECT * FROM product ,product_pricing , cart 
  WHERE 
  product.product_id =  product_pricing.product_id 
  AND 
  product_pricing.product_pricing_id  = cart.product_pricing_id
  AND 
  product.product_id  = cart.product_id 
  AND 
  cart.user_id = '${req.session.user_id}'`;

  var cart = await exe(sql);

  var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data,"is_login":verifyaccount(req) ,"cart":cart};

  if(cart.length == 0){
    res.redirect("/shop");
  }else{
  res.render("user/checkout.ejs",obj);

  }

})

route.post("/order", async function(req,res){
  var d = req.body;

   var sql = `SELECT * FROM product ,product_pricing , cart 
  WHERE 
  product.product_id =  product_pricing.product_id 
  AND 
  product_pricing.product_pricing_id  = cart.product_pricing_id
  AND 
  product.product_id  = cart.product_id 
  AND 
  cart.user_id = '${req.session.user_id}'`;

  var cart = await exe(sql);

  var sum = 0;

  var today = new Date().toISOString().slice(0, 10);


  for(var i =0 ;i<cart.length ;i++)
    sum += cart[i].product_price * cart[i].qty;

  var sql = ` INSERT INTO order_tbl (customer_name,customer_mobile,customer_state,customer_district,customer_city,customer_area,
  customer_landmark,customer_pincode,payment_type,order_date,order_amount,payment_status,order_status) VALUES
  ('${d.customer_name}',
  '${d.customer_mobile}',
  '${d.state}',
  '${d.district}',
  '${d.city}',
  '${d.area}',
  '${d.landmark}',
  '${d.pincode}',
  '${d.payment_type}',
  '${today}',
  '${sum}',
  'pending',
  'pending'
  )`;

  var data1 = await exe(sql);

  var order_id =  data1.insertId;

  for(var i =0; i<cart.length ;i++){

    var sql2 = `   INSERT INTO order_det(order_id,prodouct_id,customer_id,product_pricing_id,product_name,product_price,
    product_color,product_size,product_image1,product_company,product_qty,product_total)  
    VALUES (
    '${order_id}',
    '${cart[i].product_id}',
    '${req.session.user_id}',
    '${cart[i].product_pricing_id}',
    '${cart[i].product_name}',
    '${cart[i].product_price}',
    '${cart[i].product_colors}',
    '${cart[i].product_size}',
    '${cart[i].product_image1}',
    '${cart[i].product_company}',
    '${cart[i].qty}',
    '${cart[i].qty * cart[i].product_price}'
    )`;

    var data2 = await exe(sql2);

  }

  var sql3 = `DELETE FROM cart WHERE user_id = '${req.session.user_id}'`;

  var data3 = await exe(sql3);

  if(d.payment_type == "Online"){
    res.redirect("/payment/"+order_id);
  }else{
  res.redirect('/order_info/'+order_id)

  }

})


route.get("/order_info/:order_id",async function(req,res){


  var sql  = ` SELECT * FROM order_tbl WHERE order_id = '${req.params.order_id}'`;
  var order_data = await exe(sql);
  var sql1=` SELECT * FROM order_det WHERE order_id = '${req.params.order_id}'`;
  var order_det = await exe(sql1);
  console.log(order_det)
    var data = await exe(`SELECT * FROM about_company`);
  var obj = { about_company: data,"is_login":verifyaccount(req),"order_data":order_data,"order_det":order_det};
  res.render("user/order_info.ejs",obj)
})


route.get("/payment/:order_id", async function(req,res){
  var order_id = req.params.order_id;
  var data = await exe(`SELECT * FROM order_tbl WHERE order_id ='${order_id}'`);
  console.log(data)
  var obj = {"data":data}
  res.render("user/payment.ejs",obj)
})


route.post("/check_payment/:order_id", async function(req,res){

  var order_id = req.params.order_id;
  var sql = ` UPDATE order_tbl SET transaction_id  = '${req.body.razorpay_payment_id}' WHERE order_id = '${order_id}'`;
  var data = await exe(sql);

  res.redirect("/order_info/"+order_id)
})
module.exports = route;










        // CREATE TABLE order_det(
        // order_det_id INT PRIMARY KEY AUTO_INCREMENT ,
        // order_id  INT,
        // prodouct_id  INT ,
        // customer_id  INT ,
        // product_pricing_id  INT ,
        // product_name  VARCHAR(100),
        // product_price INT ,
        // product_color VARCHAR(100),
        // product_size VARCHAR(100),
        // product_image1  TEXT,
        // product_company VARCHAR(100),
        // product_qty INT 
        // product_total INT

        // )
