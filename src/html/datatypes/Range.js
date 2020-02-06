const TerminusClient = require('@terminusdb/terminus-client');

function HTMLRangeViewer(options){
	this.options(options);
}

HTMLRangeViewer.prototype.options = function(options){
	this.commas = (options && options.commas ? options.commas : true);
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
	this.delimiter = (options && options.delimiter ? options.delimiter : false);
}

HTMLRangeViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLRangeViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}
	
HTMLRangeViewer.prototype.render = function(value){
	var vals = TerminusClient.UTILS.TypeHelper.parseRangeValue(value, this.delimiter);
	var d = document.createElement("span");
	d.setAttribute("class", this.css);
	var rvals = document.createElement("span");
	rvals.setAttribute("class", "terminus-range-value-left");
	var svals = document.createElement("span");
	svals.setAttribute("class", "terminus-range-value-right");
	var x = (this.useCommas() ? TerminusClient.UTILS.TypeHelper.numberWithCommas(vals[0]) : vals[0]);
	var tnode = document.createTextNode(x);
	rvals.appendChild(tnode);
	d.appendChild(rvals);	
	if(vals.length == 2){
		d.appendChild(getRangeSymbolDOM());
		var x2 = (this.useCommas(renderer) ? TerminusClient.UTILS.TypeHelper.numberWithCommas(vals[1]) : vals[1]);
		var t2node = document.createTextNode(x2);
		svals.appendChild(t2node);
		d.appendChild(svals);	
	}
	return d;
}

HTMLRangeViewer.prototype.useCommas = function(){
	if(["xdd:gYearRange", "xdd:dateRange"].indexOf(this.type) != -1) return false;
	return this.commas;
}

function getRangeSymbolDOM(){
	var d = document.createElement("span");
	d.setAttribute("class", "terminus-range-indicator");
	d.setAttribute("title", "The value is uncertain, it lies somewhere in this range");
	d.appendChild(document.createTextNode(" ... "));
	return d;
}

module.exports={HTMLRangeViewer}
