//引入express模块
const express=require('express');

//引入连接池模块(上一级模块用../)
const pool=require('../pool.js');

//使用express创建路由器对象
var router=express.Router();

//1.添加路由--登录模块(post,/login):
router.post('/login',function(req,res){
	//获取post请求的数据(要在服务器下先引用中间件body-parser第三方模块)
	var $uname=req.body.uname;
	var $upwd=req.body.upwd;

	//验证数据是否为空
	if(!$uname){
		res.send('用户名不存在');
		return;
	}
	if(!$upwd){
		res.send('密码不存在');
		return;
	}

	//执行SQL语句 查询数据库
	pool.query('select * from xz_user where uname=? and upwd=?',[$uname,$upwd],function(err,result){
		if(err) throw err;
		console.log(result);
	//查询用户表中是否含有用户名、密码同时匹配的数据(条件查询)
		//判断数组的长度是否大于0  数据库中查询不到对应的用户名密码 会在服务器端返回一个空数组 数组长度为0
		//(在浏览器端做出响应)
		if(result.length>0){
			res.send('登录成功');
		}else{
			res.send('用户名或密码错误');
		}
	});
//先写get方法 在地址栏验证 127.0.0.1:8080/pro/login?uname=dingding&upwd=123456
});

//2.查询用户列表(/list)
router.get('/list',(req,res)=>{
	pool.query('select * from xz_user',(err,result)=>{
		if(err) throw err;
		console.log(result);
		res.send(result);//result在浏览器端显示的是json串
	});
});
//地址栏验证路由器页面是否能正常打开 127.0.0.1:8080/pro/list
//(第一个接口/pro是路由器在服务器页面挂载的url 第二个接口/list是访问时的接口)

//3.删除用户(get,/deleteUser)
router.get('/deleteUser',(req,res)=>{
	//获取get请求的数据(编号值)
	var $uid=req.query.uid;
	//判断是否为空
	if(!$uid){
		res.send('uid未找到');
		return;
	}
	//执行SQL语句
	var sql='delete from xz_user where uid=?';
	pool.query(sql,[$uid],(err,result)=>{
		if(err) throw err;
		console.log(result);

		//判断是否删除成功
		if(result.affectedRows>0){
			res.send('1');
		}else{
			res.send('0');
		}
		//地址栏验证 127.0.0.1:8080/pro/deleteUser?uid=3 
		//浏览器显示性别女的0 服务器显示有 affectedRows: 0,
	});
});

//4.检索用户(根据uid查询一个用户的所有信息 get,/query)
router.get('/query',(req,res)=>{
	//获取get请求的数据编号
	var $uid=req.query.uid;
	//判断是否为空
	if(!$uid){
		res.send('uid接收不到');
		return;
	}
	//执行SQL语句
	var sql='select * from xz_user where uid=?';
	pool.query(sql,[$uid],(err,result)=>{
		if(err) throw err;
		//console.log(result); //不用打印
		if(result.length>0){
			//res.send(result); //显示在浏览器端的数据是json串  外面还有数组[]
			res.send(result[0]); //显示在浏览器端的数据是json串 外面没了数组 只剩{}
		}else{
			res.send('没有查询出用户');
		}
	});
	//地址栏验证  127.0.0.1:8080/pro/query?uid=1 
});


//5.修改用户信息接口路由(post,/update)
//方法一：get(先用get方法 可以在地址栏验证 验证后再替换)
//router.get(); //未写完
//在地址栏验证  127.0.0.1:8080/pro/update?uid=1&uname=123&upwd=123&email=123&phone=123&user_name=123&gender=123 


//方法二：post(会传输数据 更安全)
router.post('/update',function(req,res){
	//获取post请求的数据
	var $uid=req.body.uid;
	var $uname=req.body.uname;
	var $upwd=req.body.upwd;
	var $email=req.body.email;
	var $phone=req.body.phone;
	var $user_name=req.body.user_name;
	var $gender=req.body.gender;
	
	//验证数据是否为空(也可以使用for循环 批量验证数据是否为空)
	if(!$uid){
		res.send('用户ID未接收到');return;
	}
	if(!$uname){
		res.send('用户名未接收到');return;
	}
	if(!$upwd){
		res.send('用户密码未接收到');return;
	}
	if(!$email){
		res.send('邮箱未接收到');return;
	}
	if(!$phone){
		res.send('用户电话未接收到');return;
	}
	if(!$user_name){
		res.send('真实姓名未接收到');return;
	}
	if(!$gender){
		res.send('用户性别未接收到');return;
	}

	//执行SQL语句(插入数据库)
	var sql='update xz_user set uname=?,upwd=?,email=?,phone=?,user_name=?,gender=? where uid=?';
	pool.query(sql,[
		$uname,
		$upwd,
		$email,
		$phone,
		$user_name,
		$gender,
		$uid
		],function(err,result){
		if(err) throw err;
		//console.log(result);
		//在服务器端显示 affectedRows: 1
		//判断是否修改成功后在浏览器端做出响应
		if(result.affectedRows>0){
			res.send('1');//1表示修改成功
		}else('0') //0表示修改失败
	});
	//post方法无法在地址栏验证  
});

//6.作业：用户注册(post,/reg)
router.post('/reg',function(req,res){
	//获取post请求的数据
	var obj=req.body;

	var $uname=req.body.uname;
	var $upwd=req.body.upwd;
	var $cpwd=req.body.cpwd;
	var $email=req.body.email;
	var $phone=req.body.phone;
	

	//验证数据是否为空(不需要验证uid是否为空)
	if(!$uname){
		res.send('用户名未接收到');
		return;
	}
	if(!$upwd){
		res.send('密码未接收到');
		return;
	}
	if(!$cpwd){
		res.send('确认密码未接收到');
		return;
	}
	if(!$email){
		res.send('邮箱未接收到');
		return;
	}
	if(!$phone){
		res.send('手机号未接收到');
		return;
	}

	//批量验证是否为空(用for循环的方式来改写)
	

	//执行SQL语句-1(查询是否有已存在的用户名)
	var search_sql='select * from xz_user where uname=?';
	pool.query(search_sql,[$uname],function(err,result){
		if(err) throw err;
		//console.log(result);

		//判断是否查询到对应用户名
	if(result.length>0){
		res.send('用户名重复 请重新输入');
	}else{'输入的用户名可用'};

	});

	//执行SQL语句-2(插入新的注册数据)
	var insert_sql='INSERT INTO xz_user SET ?';
	pool.query(insert_sql,[obj],function(err,result){
		if(err) throw err;
		//console.log(result);

		//判断是否注册成功 若注册成功响应一个对象
		if(result.affectedRows>0){
			res.send('注册成功');
		}

	});
	//post请求无法在地址栏验证 
});

//导出路由器对象
module.exports=router;