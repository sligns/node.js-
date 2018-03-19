var mysql = require('mysql')
var express = require('express')
var multer = require('multer')
var fs = require('fs')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var app = express()
var user = express.Router()
app.use(cookieParser(''))
app.use(bodyParser.urlencoded({}))
app.use(multer({dest:'./img'}).any())
app.use('/user', user)
var pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: 'haozhishuo',
	database: 'login',
	port: 3306
})




//头像图片  
user.post('/img',function(req,res){
  res.setHeader('Access-Control-Allow-Origin', '*')
	var img = req.files
	var name = req.files[0].filename
	var newName = name+path.parse(req.files[0].originalname).ext
	var hname = req.files[0].filename+ path.parse(req.files[0].originalname).ext;
    var thisTime = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString();
	fs.rename('./img/'+name,'./img/'+newName,function(err){
		if(err){
			console.log(err)
			return
		}else{
						pool.getConnection((err,c)=>{
				if(err){
					console.log(err);
					return
				}
				else{
					c.query('INSERT INTO `'+req.body.user+'` (`lname`,`hname`,`size`,`type`,`download`,`times`) VALUES("'+req.files[0].originalname+'","'+hname+'","'+req.files[0].size+'","'+path.parse(req.files[0].originalname).ext+'","0","'+thisTime+'");',(err,data)=>{
						if(err){
							console.log(err);
							return

						}
						else{
							
							c.query('INSERT INTO `scfile` (`lname`,`hname`,`size`,`type`,`download`,`times`,`user`) VALUES("'+req.files[0].originalname+'","'+hname+'","'+req.files[0].size+'","'+path.parse(req.files[0].originalname).ext+'","0","'+thisTime+'","'+req.body.user+'");',(err,data)=>{
								if(err){
									console.log(err);
									return
								}
								else{
									return res.send({hash:hname,timer:thisTime,'data':data});

								}
								c.end();

							})

						}
					})
					
				}
			})
			
		}
		
	})

})


//上传文件
user.post('/files',function(req,res){
  res.setHeader('Access-Control-Allow-Origin', '*')
	var img = req.files
	var name = req.files[0].filename
	var newName = name+path.parse(req.files[0].originalname).ext
	var hname = req.files[0].filename+ path.parse(req.files[0].originalname).ext;
    var thisTime = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString();
	fs.rename('./img/'+name,'./img/'+newName,function(err){
		if(err){
			console.log(err)
			return
		}else{
						pool.getConnection((err,c)=>{
				if(err){
					console.log(err);
					return
				}
				else{
					c.query('INSERT INTO `'+req.body.user+'` (`lname`,`hname`,`size`,`type`,`download`,`times`) VALUES("'+req.files[0].originalname+'","'+hname+'","'+req.files[0].size+'","'+path.parse(req.files[0].originalname).ext+'","0","'+thisTime+'");',(err,data)=>{
						if(err){
							console.log(err);
							return

						}
						else{
							
							c.query('INSERT INTO `scfile` (`lname`,`hname`,`size`,`type`,`download`,`times`,`user`) VALUES("'+req.files[0].originalname+'","'+hname+'","'+req.files[0].size+'","'+path.parse(req.files[0].originalname).ext+'","0","'+thisTime+'","'+req.body.user+'");',(err,data)=>{
								if(err){
									console.log(err);
									return
								}
								else{
								return res.send({'ok':1,'msg':'上传成功',hash:hname,timer:thisTime,'data':data});

								}
								c.end();

							})

						}
					})
						c.end();
				}
			})
			
		}
		
	})

})


//注册

user.use('/zhuce',(req,res)=>{
	pool.getConnection((err,c)=>{
		if(err){
			console.log(err);
			return
		}
		else{
			c.query('SELECT user FROM `user` WHERE user="'+req.query.user+'";',(err,data)=>{
				if(err){
					console.log(err);
					return
				}
				else{
					if(data.length>0){
					return	res.send('用户名已占用');
						c.end();
					}
					else{
						c.query('INSERT INTO `user` (`user`,`pass`,`hurl`) VALUES("'+req.query.user+'","'+req.query.pass+'","'+req.query.hurl+'");',(err,data)=>{
							if(err){
								console.log(err);
								return
							}
							else{
								
								c.query(`CREATE TABLE ${req.query.user}
									(
										ID int(255) NOT NULL AUTO_INCREMENT,
										lname varchar(255) NOT NULL,
										hname varchar(255) NOT NULL,
										times varchar(255) NOT NULL,
										type varchar(255),
										size varchar(255) NOT NULL,
										download varchar(255) NOT NULL,
										PRIMARY KEY (ID)
									)`,(err,data)=>{

									if(err){
										console.log(err);
										return
									}
									else{
									return	res.send('恭喜您,注册成功');
									};
									c.end();		


								})



							}	
						
						})
					}
				}
			});
		}
	});
});



//登录
user.use('/denglu', function(req, res) {
	var user=req.query.user
	var pass=req.query.pass
	//req.secret = ''
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log('connection::' + err)
			return
		}else{
		connection.query('select * from user where user=?', [user], function(err, data) {
			if(err) {
				console.log('mysql::' + err)
				return
			}
			if(data == '') {
			return	res.send('用户名不存在')
					connection.end();
			}
			else if(data[0].pass == pass) {
				
								connection.query('SELECT * FROM `'+user+'`;',(err,data)=>{
							if(err){
								console.log(err);
								return
							}
							else{
							res.cookie('user',user+'-'+pass,{maxAge:15*60*100})
							return	res.send({'msg':'登陆成功,欢迎来到网盘录入系统','data':data});
						
							}
							res.clearCookie('user')
							connection.end();
					});		
				} else {
				return	res.send('用户名或密码不对')
				}
		  
			})

		}
		
	})

})







//记住密码
//user.use('/islogin', function(req, res) {
//	var user=req.query.user
//	var pass=req.query.pass
//	var check=req.query.check
//	console.log(check)
//	//req.secret = ''
//	pool.getConnection(function(err, connection) {
//		if(err) {
//			console.log('connection::' + err)
//			return
//		}else{
//		connection.query('SELECT  *  FROM `user` WHERE user="'+user+'" AND pass="'+pass+'";', function(err, data) {
//			if(err) {
//				console.log(err)
//				return
//			} else {
//
//				if(check==false){
//				return res.send('')
//				}else{
//				return res.send(data)
//				}
//			
//				}
//		  
//			})
//
//		}
//		
//	})
//
//})

//退出登录
user.use('/tui', function(req, res) {
	var user=req.query.user
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log('connection::' + err)
			return
		}else{
		connection.query('select * from user where user=?', [user], function(err, data) {
			if(err) {
				console.log('mysql::' + err)
				return
			} else {
				res.clearCookie('user')
				return	res.send(data)
				}
		  
			})

		}
		
	})

})

//获取用户信息
user.get('/show', function(req, res) {
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log('connection：：' + err)
			return
		}
		var s = 'select * from scfile'
		connection.query(s,function(err, data) {
			if(err) {
				console.log('mysql：：' + err)
				return
			}

		return	res.send(data)
			connection.end()
		})
	})

})


//刷新渲染页面
user.get('/loginshow', function(req, res){
	var user=req.query.user
	pool.getConnection(function(err, c){
		if(err) {
			console.log(err)
			return
		}
					c.query('SELECT * FROM `'+user+'`;',function(err,data){
							if(err){
								console.log(err);
							    return
							}
							else{
								
						
							return	res.send(data);		
							}
							c.end();
					})
	})

})

//////下载


user.use('/dow',(req,res)=>{
		var id=req.body.id
		var download = req.body.num
		var user=req.body.user
	pool.getConnection((err,c)=>{
		if(err){
			console.log(err);
			return
	
		}
		else{
			c.query('SELECT download FROM `scfile` WHERE user="'+user+'";',(err,data)=>{
				if(err){
					console.log(err);
					return
				}
				else{
					c.query('UPDATE `scfile` SET download="'+download+'" WHERE ID="'+id+'";',(err,data)=>{
						if(err){
							console.log(err);
							return
						}
						else{
							c.query('UPDATE `'+user+'` SET download="'+download+'" WHERE ID="'+id+'";',(err,data)=>{
								if(err){
									console.log(err);
									return
								}
								else{
									c.query('SELECT * FROM `'+user+'`;',(err,data)=>{
											if(err){
									console.log(err);
									return
								}else{
									return	res.send(data);
								}
								c.end();
									})
								
								}
						
							})
						}
					})
				}
			})

		}

	})
});

//删除
//user.use('/del',function(req,res){
//  var id=req.query.id
//  var user=req.query.user
//  console.log(id)
//   pool.getConnection(function(err,connection){
//    if(err){
//          console.log('connection::'+err)
//          return
//      } 
//   connection.query('delete from `'+user+'` where uid=?',[id],function(err,data){
//          if(err){
//              console.log('connection::'+err)
//          return
//          }
//        res.send('ok')
//         })
//          connection.end()
// })
//})

//搜索
user.use('/search', function (req, res) {
    pool.query(`SELECT * FROM ${req.query.user} WHERE lname  LIKE '%${req.query.search}%'`, function (err, rows) {
        if (err) throw err;
        res.send(rows);
    })
})




app.use(express.static('./'))
app.listen(8000, function() {
	console.log('ok')
})