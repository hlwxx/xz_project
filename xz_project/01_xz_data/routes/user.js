//引入express模块
const express=require('express');

//引入连接池模块(上一级模块用../)
const pool=require('../pool.js');

//使用express创建路由器对象
var router=express.Router();

//往路由器对象中添加路由(get,/login)
/*
//测试路由
router.get('/login',function(req,res){
	res.send('这是注册');
});
*/

//1.用户注册路由(get,/reg):
router.get('/reg',function(req,res){
	//获取get请求的数据
	var obj=req.query;
	//检测值是否为空 若为空响应一个对象 
	//若在浏览器端的值为空 则在浏览器端显示 {"code":401,"msg":"uname required"}
	//检测一个值是否为空:
	//obj.uname若为空->false  obj.uname若为非空->true
	//if条件若为true 则执行大括号里面的代码
	if(!obj.uname){
		res.send({code:401,msg:'uname required'});
		//阻止往后执行 防止多次send调用报错
		//Cannot set headers after they are sent to the client
		//在函数体里加return
		//服务器端就不会报错
		return;
	}
	
	if(!obj.upwd){
		res.send({code:402,msg:'upwd required'});
		return;
	}

	if(!obj.phone){
		res.send({code:403,msg:'phone required'});
		return;
	}

	if(!obj.email){
		res.send({code:404,msg:'emil required'});
		return;
	}
	//在浏览器端进行非空测试

	//(在路由器内部进行)执行SQL语句 操作数据 将用户注册的数据插入到用户数据表xz_user中
	//(先连接mysql数据库)
	pool.query('INSERT INTO xz_user SET ?',[obj],function(err,result){
		if(err) throw err;
		console.log(result);
		//判断是否注册成功 若注册成功响应一个对象
		if(result.affectedRows>0){
			res.send({code:200,msg:'reg sucs'});
		}
	});
	//测试是否注册成功
	//在浏览器端注册成功后会显示{"code":200,"msg":"reg sucs"}
	//服务器显示OkPacket里是一个对象形式的数据 affectedRows: 1 大于0
	//在数据库中查看是否多了刚注册输入的一条信息 

	//console.log(obj); //服务器端得到对象形式的数据
	//res.send('注册成功'); //测试 响应 浏览器端显示'注册成功'
});

//2.用户登录路由(post,/login):
router.post('/login',function(req,res){
	//获取post请求的数据(在服务器下先引用中间件body-parser第三方模块)
	var obj=req.body;
	console.log(obj);
	//验证数据是否为空
	if(!obj.uname){
		res.send({code:401,msg:'uname required'});
		return;
	}

	if(!obj.upwd){
		res.send({code:402,msg:'upwd required'});
		return;
	}

	//执行SQL语句:
	//判断登录成功或失败
	//查询用户表中是否含有用户名、密码同时匹配的数据(条件查询)
	pool.query('SELECT * FROM xz_user WHERE uname=? AND upwd=?',[obj.uname,obj.upwd],function(err,result){
		if(err) throw err;
		console.log(result);
		//输入正确的用户名及密码 则服务器端显示的是一个数组形式的数据
		//输入错误的用户名及密码 则服务器端显示的是空数组
		//判断数组的长度是否大于0(在浏览器端做出响应)
		if(result.length>0){
		res.send({code:200,msg:'login suc'});
		}else{
			res.send({code:301,msg:'login err'});
		}
		//若输入正确的用户名及密码 则浏览器端显示{"code":200,"msg":"login suc"}
		//若输入错误的用户名及密码 则浏览器端显示{"code":301,"msg":"login err"}
	});
	//res.send('登录成功'); //测试 在浏览器端显示'登录成功'
	//在服务器端获得一个对象形式的数据
	//在浏览器端进行非空测试
});

//3.修改用户路由(get,/update):
router.get('/update',function(req,res){
	//获取get请求的数据
	var obj=req.query;
	console.log(obj);
	//服务器端会得到一个对象形式的数据

	//验证数据是否为空(批量验证数据是否为空):
	//遍历对象 获取所有对象的属性值
	//在循环前初始化状态码为400
	var n=400;
	for(var key in obj){
		//每得到一个属性名及值后状态码加1
		n++;
		//console.log(key,obj[key]);
		//服务器端得到每个属性名及属性值
		//判断属性值是否为空
		if(!obj[key]){
			//下面的状态码code直接写n 即可实现自增分配不同的状态码
			res.send({code:n,msg:key+' required'});
			return;
		}
	}
	//在浏览器端进行非空验证

	//执行SQL语句(按数据库中的列顺序来写 uid作为条件放在最后)
	pool.query('UPDATE xz_user SET phone=?,email=?,user_name=?,gender=? WHERE uid=?',[
		obj.phone,
		obj.email,
		obj.user_name,
		obj.gender,
		obj.uid
		],function(err,result){
		if(err) throw err;
		//console.log(result);
		//在服务器端显示 affectedRows: 1
		//判断是否修改成功后在浏览器端做出响应
		if(result.affectedRows>0){
			res.send({code:200,msg:'update suc'});
		}else{
			res.send({code:301,msg:'update err'});
			}
	});
	//若修改成功 则在浏览器端显示{"code":200,"msg":"update suc"} 在服务器端获得修改后的数据对象
	//若修改失败  则在浏览器端显示{"code":301,"msg":"update err"}
	//res.send('修改成功');
});

//4.用户检索路由(get,/detail):
router.get('/detail',function(req,res){
	//获取get请求的数据
	var obj=req.query;
	console.log(obj);
	//在浏览器端输入某个编号后 服务器端得到uid数据
	
	//验证是否为空
	if(!obj.uid){
		res.send({code:401,msg:'uid required'});
		return;
	}
	//在浏览器端进行非空测试 若为空会显示{"code":401,"msg":"uid required"}

	//执行SQL语句(查询编号对应的用户) 把result响应到浏览器
	pool.query('SELECT * FROM xz_user WHERE uid=? ',[obj.uid],function(err,result){
		if(err) throw err;
		//直接把查询结果result响应到浏览器端 而不用打印
		res.send(result);
		//在浏览器端显示编号对应的用户数据 不存在编号则返回一个空数组
		//服务器端获取对应uid 
		//console.log(result); //服务器端显示的是一个数组形式的数据
	});
});

//5.用户列表路由(get,/list):
router.get('/list',function(req,res){
	//获取get请求的数据
	var obj=req.query;
	//console.log(obj);
	//在服务器端得到对象形式的页码及大小数据
	
	//验证是否为空
	//若页码为空 设置默认值为1
	//若大小为空 设置默认值为3
	//if后面只有一行语句 则可以省略大括号 
	if(!obj.pno) obj.pno=1;
	if(!obj.count) obj.count=3;
	//console.log(obj);
	//若在浏览器端不输入直接提交 则在服务器端会显示数值{ pno: 1, count: 3 }
	//若在浏览器端输入后提交 则在服务器端会显示字符串型数据 { pno: '1', count: '5' }

	//将传递的值转为整型
	//limit后面原来的字符串型的数据要转成数值整型 否则会报错
	obj.pno=parseInt(obj.pno);
	obj.count=parseInt(obj.count);
	//console.log(obj);

	//计算开始查询的值  start=(页码-1)*数据量
	var start=(obj.pno-1)*obj.count

	//执行SQL语句
	pool.query('SELECT * FROM xz_user LIMIT ?,?',[start,obj.count],function(err,result){
		if(err) throw err;
		//把查询结果result响应到浏览器端
		res.send(result);
	});
	//在浏览器端输入页码及大小 会响应对应的数据
});

//6.用户删除路由(get,/user/delete):
router.get('/delete',function(req,res){
	//获取get请求的数据
	var obj=req.query;
	//console.log(obj);
	//在浏览器端输入数字后 在服务器端会得到对象形式的uid数据

	//验证是否为空
	if(!obj.uid){
		res.send({code:401,msg:'uid required'});
		return;
	}

	//执行SQL语句
	pool.query('DELETE FROM xz_user WHERE uid=?',[obj.uid],function(err,result){
		if(err) throw err;
		//console.log(result);
		//若删除不存在的数据 服务器端 affectedRows: 0
		//若删除存在的数据 服务器端 affectedRows: 1
		//判断是否删除成功
		if(result.affectedRows>0){
			res.send({code:200,msg:'delete suc'});
		}else{
			res.send({code:301,msg:'delete err'});
		}
	});
	//若删除成功 则在浏览器端显示{"code":200,"msg":"delete suc"}
	//若删除失败则在浏览器端显示{"code":301,"msg":"delete err"}
});

//导出路由器对象
module.exports=router;