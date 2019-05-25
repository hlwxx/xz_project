//引入express模块
const express=require('express');

//引入用户路由器模块(自定义模块 同一路径要加./)
const userRouter=require('./routes/user.js');

//引入商品路由器模块(自定义模块 同一路径要加./)
const proRouter=require('./routes/pro.js');

//引入中间件body-parser(第三方模块) 
const bodyParser=require('body-parser');

//创建web服务器
var server=express();

//设置端口
server.listen(8080);

//托管静态资源到public下
server.use( express.static('public') );

//托管静态资源到mypro下
server.use( express.static('mypro') );

//使用body-parser中间件 将post请求的数据格式化为对象
server.use( bodyParser.urlencoded({
	//不使用拓展的第三方qs模块 而是使用核心模块querysting
	extended:false
}) );

//使用路由器(参数为挂载的url为/user，引入时的路由器名)
server.use('/user',userRouter);

//使用路由器后路由访问形式变成 /user/login
//user_reg.html表单请求的时候 url也要写 /user/reg

//使用路由器(参数为挂载的url为/pro，引入时的路由器名)
server.use('/pro',proRouter);





