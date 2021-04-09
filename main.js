const mysql = require('mysql');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const csvtojson = require('csvtojson');
const upload = require('express-fileupload');
const formidable = require('formidable');
const fs = require('fs');
const ejs = require('ejs');

app.use(upload());
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({extended:false})) 
app.use(bodyparser.json()) 

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "goodpass",
	database: "sampledb",
	multipleStatements: true
});

app.get('/', function (req, res) {
	console.log("Someone is on Front Page");
   res.render('./index.html');
});

app.post('/', function (req, res){
	console.log("Someone Uploaded a File");
    if(req.files){
		var file = req.files.file;
		var fileN = file.name;
		 file.mv("./uploads/"+fileN, function(err){
		     if(err) res.send(err);
		 });
		var fileName = "./uploads/"+fileN;
  
csvtojson().fromFile(fileName).then(source => { 
    for (var i = 0; i < source.length; i++) { 
        var Name = source[i]["Name"], 
            Roll_No = source[i]["Roll_no"],
			Class = source[i]["Class"];
        var insertStatement =  
        `INSERT INTO student values(?, ?, ?)`; 
        var items = [Name, Roll_No, Class]; 
        con.query(insertStatement, items,  
            (err, results, fields) => { 
            if (err) { 
                console.log( 
    "Unable to insert item at row ", i + 1); 
                return console.log(err); 
            } 
        }); 
    }  
});
		con.query("SELECT * FROM student", function(err, result, fields){
		if(err) throw err;
		res.render('./data.ejs', {'data' : result});
	});
	}
});

app.get('/show', function (req, res) {
	console.log("Someone Viewed All Data");
	con.query("SELECT * FROM student", function(err, result, fields){
		if(err) throw err;
		res.render('./data.ejs', {'data' : result});
	});
});

app.get("/search", function(req,res){
	console.log("Someone is on Search Page");
	res.render('./search.html')
});

app.get('/searchbyval', function(req,res){
	console.log("Someone Searched a Query");
	var name = req.query.name;
	var rollno = req.query.rollno;
	var clas = req.query.class;
	var qry;
	if(name=="" && rollno=="" && clas==""){
		qry = "SELECT * FROM student";		
	}
	else if(name=="" && clas==""){
		qry = "SELECT * FROM student WHERE rollno = '" + rollno +"'";
	} else if (rollno=="" && clas==""){
		qry = "SELECT * FROM student WHERE name = '" + name + "'";
	} else if (rollno=="" && name==""){
		qry = "SELECT * FROM student WHERE class = '" + clas + "'";
	} else if (rollno==""){
		qry = "SELECT * FROM student WHERE class = '" + clas + "' and name = '" + name + "'";
	} else if (clas==""){
		qry = "SELECT * FROM student WHERE rollno = '" + rollno + "' and name = '" + name + "'";
	} else if (name==""){
		qry = "SELECT * FROM student WHERE class = '" + clas + "' and rollno = '" + rollno + "'";
	}
	else {
		qry = "SELECT * FROM student WHERE rollno = '" + rollno + "' and name = '" + name + "' and class = '" + clas + "'" ;
	}
	
	con.query(qry, function(err, result, fields){
		if(err) throw err;
		res.render('./data.ejs', {'data' : result});
	});
	
});

app.get("/note", function(req,res){
	console.log("Someone Read the Instructions");
	res.render("./note.html");
});

app.listen(process.env.port || 4000, ()=>{
	console.log("server started");
});

