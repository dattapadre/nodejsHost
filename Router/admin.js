const express = require("express");
const route = express.Router();

const exe = require("./../connection");

route.get("/",function(req,res){
    res.render("admin/index.ejs");
});

route.get("/about_company",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data}
    res.render("admin/about_company.ejs",obj);
})

route.post("/about_company", async function(req,res){
    var d = req.body;
    var  sql = `UPDATE about_company SET  
    company_name='${d.company_name}',
    company_mobile ='${d.company_mobile}',
    company_email ='${d.company_email}',
    company_address ='${d.company_address}',
    company_what ='${d.company_what}',
    youtube ='${d.youtube}',
    inst='${d.inst}',
    telegram='${d.telegram}'`

    var data = await exe(sql);
    res.redirect("/admin/about_company")
})

route.get("/slider", async function(req,res){
     var slider = await exe(`SELECT * FROM slider`);
     var obj ={"slider":slider};
    res.render("admin/slider.ejs",obj)
})


route.post("/slider", async function(req,res){
    var d = req.body ;
    // step 1 
    if(req.files){
        var FileName = Date.now()+req.files.slider_image.name;
        req.files.slider_image.mv("public/"+FileName);
    }

    var sql = ` INSERT INTO slider (title,details,btn_text,btn_url,slider_image)
    VALUES
    ('${d.title}','${d.details}','${d.btn_text}','${d.btn_url}','${FileName}')`;
    var data = await exe(sql);

    res.redirect("/admin/slider")
})

route.get("/delete_slider/:id",async function(req,res){
    var id = req.params.id;
    var data = await exe(`DELETE FROM slider WHERE id ='${id}'`);
    res.redirect("/admin/slider")
})


route.get("/categary", async function(req,res){
    var data = await exe(`SELECT * FROM categary`);
    var obj ={"categary":data}
    res.render("admin/categary.ejs",obj)
});


route.post("/categary", async function(req,res){
    var sql = ` INSERT INTO categary (categary_name )VALUES("${req.body.categary_name}")`
    var data = await exe(sql);
    res.redirect("/admin/categary")
})

route.get("/delete_categary/:id" , async function(req,res){
    var id = req.params.id;
    var data = await exe(`DELETE FROM categary  WHERE categary_id = '${id}'`);
    res.redirect("/admin/categary")
})

route.get("/add_product", async function(req,res){
    var categary = await exe(`SELECT * FROM categary`);
    var obj ={"categary":categary}
    res.render("admin/add_product.ejs",obj)
})

route.post("/save_product", async function(req,res){
    // part 1 

    if(req.files  && req.files.product_image1 ){
        var product_image1 = Date.now()+req.files.product_image1.name;
        req.files.product_image1.mv("public/upload/"+product_image1);
    }

        if(req.files  && req.files.product_image2){
        var product_image2 = Date.now()+req.files.product_image2.name;
        req.files.product_image2.mv("public/upload/"+product_image2);
    }

         if(req.files  && req.files.product_image3){
        var product_image3 = Date.now()+req.files.product_image3.name;
        req.files.product_image3.mv("public/upload/"+product_image3);
    }else{
    product_image3 ='';
    }

       if(req.files  && req.files.product_image4){
        var product_image4 = Date.now()+req.files.product_image4.name;
        req.files.product_image4.mv("public/upload/"+product_image4);
    }else{
    product_image3 ='';
    }

    var d = req.body;

    var sql = `INSERT INTO product (categary_id,
    product_name,
    product_colors,
    product_label,
    product_company,
    product_details,
    product_image1,
    product_image2,
    product_image3,
    product_image4
    ) VALUES(?,?,?,?,?,?,?,?,?,?)`

    var data = await exe(sql,[d.categary_id,
        d.product_name,
        d.product_colors,
        d.product_label,
        d.product_company,
        d.product_details,
        product_image1,
        product_image2,
        product_image3,
        product_image4]);

    var product_id = data.insertId;



    for(var i=0 ;i<d.product_size.length;i++){

           var sql1 = `INSERT INTO product_pricing (product_id,product_size,product_price,product_duplicate_price)
    VALUES
    ('${product_id}','${d.product_size[i]}','${d.product_price[i]}','${d.product_duplicate_price[i]}')`

    var data1 = await exe(sql1);

    console.log(d.product_size[i])

    }

    res.send(data1)
})

route.get("/product_list", async function(req,res){

    var sql = `SELECT *,
          (SELECT MIN(product_price) FROM product_pricing 
          WHERE product.product_id = product_pricing.product_id)
           AS price ,
           
           (SELECT MAX(product_duplicate_price) FROM product_pricing 
           WHERE product.product_id = product_pricing.product_id)
           AS product_duplicate_price   FROM product `;

           var data = await exe(sql);

           var obj = {"product_info":data}

    res.render("admin/product_list.ejs",obj)
    // res.send(data)
})

route.get("/delete_product/:id", async function(req,res){
    var id = req.params.id;

    var data = await exe(`DELETE FROM product WHERE product_id = '${id}'`);
    // res.send(data)
    res.redirect("/admin/product_list")
})


route.get("/view_product/:id",async function(req,res){
    var id = req.params.id ;
    var product = await exe(`SELECT  * FROM product WHERE product_id ='${id}'`);
    var product_price = await exe(`SELECT  * FROM  product_pricing WHERE product_id ='${id}'`);

    var obj = {"product_info":product,"product_price":product_price}
    res.render("admin/view_product.ejs",obj)
})

route.get("/orders_list/:status", async function(req,res){
    var status = req.params.status;
    var sql = ` SELECT * FROM order_tbl WHERE order_status ='${status}'`;
    var data = await exe(sql);
    var obj = {"status":status ,"orders":data }
    console.log(data)
    res.render("admin/order_list.ejs",obj)
})

route.get("/order_info/:order_id",async function(req,res){

var sql  = ` SELECT * FROM order_tbl WHERE order_id = '${req.params.order_id}'`;
  var order_data = await exe(sql);
  var sql1=` SELECT * FROM order_det WHERE order_id = '${req.params.order_id}'`;
  var order_det = await exe(sql1);

  var obj = {"order_data":order_data,"order_det":order_det};
    res.render("admin/order_info.ejs",obj)
})

route.get("/transper_order/:order_id/:status",async function(req,res){
    var status = req.params.status;
    var order_id = req.params.order_id;

     var today = new Date().toISOString().slice(0, 10);

    if(status == 'cancelled')
        var sql = ` UPDATE order_tbl SET order_status='${status}',cancelled_date = '${today}' WHERE order_id ='${order_id}'`
    else if(status == 'rejected')
        var sql = ` UPDATE order_tbl SET order_status='${status}', rejected_date = '${today}' WHERE order_id ='${order_id}'`
    else if(status == 'returned')
        var sql = ` UPDATE order_tbl SET order_status='${status}', returned_date = '${today}' WHERE order_id ='${order_id}'`
    else if(status == 'delivered')
        var sql = ` UPDATE order_tbl SET order_status='${status}', delivered_date = '${today}' WHERE order_id ='${order_id}'`
    else if(status == 'dispatched')
        var sql = ` UPDATE order_tbl SET order_status='${status}', dispatched_date = '${today}' WHERE order_id ='${order_id}'`

    var data = await exe(sql);

res.redirect("/admin/orders_list/"+status)
})

module.exports = route;