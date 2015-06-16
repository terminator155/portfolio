var sitePath = "http://52.11.248.163:3700";

window.onload = function() {
	socket = io.connect(sitePath);
	var requestDataButton = document.getElementById("requestData");
	var stockTable = document.getElementById("stockTable");
	
	var stockNames;
	var profit;
	var risk;
	var levels;
	var selectedIndex;
	var allStockNames;
	var allStockMean;
	var allStockVar;
	
	var isWaitingForData = true;
	
	socket.emit('requestAllStocks',{data:null});
	
	socket.on('allStockData',function(data){
		allStockNames = data.stocks;
		allStockMean = data.mean;
		allStockVar = data.variance;
		
		var count = allStockNames.length;
		
		var preSelection = "1,3,6,12,19,22,24,26";
		var preIndex = [1,3,6,12,19,22,24,26];
		selectedIndex = preIndex;
		
		for(var i=0;i<count;i++)
		{
			var tr = document.createElement('tr');
			var tdN = document.createElement('td');
			tdN.appendChild(document.createTextNode(allStockNames[i]));
			tr.appendChild(tdN);
			
			var tdE = document.createElement('td');
			tdE.appendChild(document.createTextNode(allStockMean[i].toFixed(9)));
			tr.appendChild(tdE);
			
			var tdV = document.createElement('td');
			tdV.appendChild(document.createTextNode(allStockVar[i].toFixed(9)));
			tr.appendChild(tdV);
			
			var tdS = document.createElement('td');
			var sel = document.createElement('input');
			sel.setAttribute('type','checkbox');
			sel.setAttribute('id',""+i+"");
			sel.setAttribute('class','selection');
			if(preIndex.indexOf(i) != -1)
				sel.setAttribute('checked',true);
			
			tdS.appendChild(sel);
			tr.appendChild(tdS);
			
			if(i%2==0)
				tr.setAttribute('class','alt');
			else
				tr.setAttribute('class','normal');
			
			stockTable.appendChild(tr);
		}
		
		socket.emit('requestOptimizedData',{index:preSelection});
		isWaitingForData = true;
	});
	
	socket.on('receiveOptimizedData',function(received){
		if(isWaitingForData != true)
			return;
		isWaitingForData = false;
		//alert("data received");
		stockNames = [];
		var count = selectedIndex.length;
		for(var i=0;i<count;i++)
			stockNames.push(allStockNames[selectedIndex[i]]);
		profit = received.profit;
		risk = received.risk;
		levels = received.levels;
		
		var count = stockNames.length;
		var charts = $('#container').highcharts();
		
		charts.series[0].setData(profit,false);
		charts.series[1].setData(risk,false);
		
		var oldCount = charts.series.length;
		
		for(var i=2;i<oldCount;i++)
		{
			charts.series[2].remove(false);
		}
		
		var levelCount = levels[0].length;
		var newCates = [];
		for(var i=0;i<levelCount;i++)
		{
			newCates.push("Level "+(i+1));
		}
		
		charts.xAxis[0].setCategories(newCates,false);
		
		for(var i=0;i<count;i++)
 		{
 			charts.addSeries({
 				name:stockNames[i],
 				type:'column',
 				yAxis:2,
 				data:levels[i]
 			});
 		}
		
		charts.redraw();
	});
	
	requestDataButton.onclick = function()
	{
		requestOptimizedData();
	};
	
	function requestOptimizedData()
	{
		var boxes = document.getElementsByClassName('selection');
		var index = [];
		var count = boxes.length;
		
		for(var i=0;i<count;i++)
		{
			var box = boxes[i];
			if(box.checked ==true)
				index.push(box.getAttribute('id'));
		}
		if(index.length<2)
			alert("Veuillez sélectionner au moins 2 bourses");
		index.sort(function(a,b){
			return a-b;
		});
		//alert("selected:"+index );
		var count = index.length;
		var strIdx = "";
		for(var i=0;i<count;i++)
		{
			strIdx += parseInt(index[i]);
			if(i != count-1)
				strIdx += ",";
		}
		selectedIndex = index;
		//alert("index string: "+strIdx);
		
		socket.emit('requestOptimizedData',{index:strIdx});
		//alert("request sent");
		isWaitingForData = true;
	}
}