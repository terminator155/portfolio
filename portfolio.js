var express = require("express");
var fs = require("fs");
var app = express();
var port = 3700;
var httpPort = 3800;

var allSockets = {};

var http = require("http");
var server = http.createServer(function(req,res){
	var body = '';
	
	req.on('data',function(data){
		body += data;
		console.log("Http message received");
	});
	
	req.on('end',function(){
		console.log("Full http message: "+body);
		var data = JSON.parse(body);
		console.log("Parsed message: "+data);
		var socketId = data.socket;
		console.log("socket id: "+socketId);
		var socket = allSockets[socketId];
		//data.stocks = ["ABC","CGR","FEZ","YPO","MMK","TBV"];
		
		socket.emit('receiveOptimizedData',data);
		body = '';
		//socket.emit('receiveOptimizedData',{stocks:stockNames,profit:profit,risk:risk,levels:levels});
	});
});
server.listen(httpPort);
console.log("HTTP listening on "+httpPort);

app.set('view engine',"ejs");
app.use(express.static(__dirname+'/public'));

app.get("/",function(req,res){
	res.render(index.html);
});

var spawn = require('child_process').spawn;
var allStockNames = ["DLBL","LMBS","DTUL","FEMB","SBFGP","TUSA","CLAC","IGOV","VWOB","GAINO","FITBI","IFV","FTGC","AINV","CPTA","COMT","JASN","PDBC","DSWL","SKIS","VALX","MTLS","PRGN","EARS","APTO","PSTR","CACH"];
var allStockExp = [0.00001489097920886311,0.00005363329865472162,0.00010209395130462691,0.00016278288548825028,0.00032825754689318795,0.00034522015605410880,0.00039263680295347153,0.00043616487062932150,0.00101832657451361260,0.00111129266535525840,0.00216642562672179100,0.00233199265624942430,0.00233515403170113250,0.00315191017124852570,0.00370470192964461160,0.00462376140123442500,0.00488298594853429000,0.00516349538991844300,0.00657530530628298400,0.00822437046759868700,0.00857919340523949400,0.01022168955699141600,0.01191092597646955600,0.01597015904348895700,0.02066766576722219000,0.02244625629882524700,0.02661910892450524600];
var allStockVar = [9.0071817682E-9,3.396409052141E-7,9.0061611426727E-7,1.49597706951083E-6,1.50854223929267E-6,3.25331242923523E-6,8.77200209936871E-6,9.18684298813287E-6,7.51602351050177E-6,1.459008531426303E-5,2.769626123617752E-5,7.191549604576987E-5,5.888772237294435E-5,1.1731331774807296E-4,1.5840661040667135E-4,2.1953448658065914E-4,2.7816112178707773E-4,3.4140790441607616E-4,4.904927074887458E-4,5.515073878852382E-4,9.129507015802193E-4,0.0016895450552783203,0.0018206391252915532,0.0014633637731229926,0.002448912050422544,0.00509307301500451,	0.010022326089295276];

var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function(socket){
	
	allSockets[socket.id] = socket;
	
	socket.on('requestAllStocks',function(data){
		socket.emit('allStockData',{stocks:allStockNames,mean:allStockExp,variance:allStockVar});
	});
	
	socket.on('requestOptimizedData',function(data){
		// var stockNames = ["ABC","CGR","FEZ","YPO","MMK","TBV"];
// 		var profit = [9, 8 , 7, 6, 5];
// 		var risk = [3, 1.1, 0.7, 0.2,0.1];
// 		var levels = [
// 			[1,0,0,0,0],
// 			[0.9,0.1,0,0,0],
// 			[0.3,0.4,0,0.3],
// 			[0,0.1,0.4,0.2,0.3],
// 			[0,0,0.6,0.1,0.1],
// 			[0,0,0,0.3,0.6]
// 		];
		console.log("received request index: "+data.index);
		spawn('java',["-jar","portfolio.jar",data.index,socket.id]);
	});
	
});

console.log("Listening on port "+port);