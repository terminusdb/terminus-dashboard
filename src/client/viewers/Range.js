const FrameHelper = require('../../FrameHelper');

function HTMLRangeViewer(options){
	this.commas = (options && options.commas ? options.commas : true);
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
	this.delimiter = (options && options.delimiter ? options.delimiter : false);
}

HTMLRangeViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var vals = FrameHelper.parseRangeValue(value, this.delimiter);
	var d = document.createElement("span");
	d.setAttribute("class", this.css);
	var rvals = document.createElement("span");
	rvals.setAttribute("class", "terminus-range-value-left");
	var svals = document.createElement("span");
	svals.setAttribute("class", "terminus-range-value-right");
	var x = (this.commas ? FrameHelper.numberWithCommas(vals[0]) : vals[0]);
	var tnode = document.createTextNode(x);
	rvals.appendChild(tnode);
	d.appendChild(rvals);	
	if(vals.length == 2){
		d.appendChild(getRangeSymbolDOM());
		var x2 = (this.commas ? FrameHelper.numberWithCommas(vals[1]) : vals[1]);
		var t2node = document.createTextNode(x2);
		svals.appendChild(t2node);
		d.appendChild(svals);	
	}
	return d;
}

function getRangeSymbolDOM(){
	var d = document.createElement("span");
	d.setAttribute("class", "terminus-range-indicator");
	d.setAttribute("title", "The value is uncertain, it lies somewhere in this range");
	d.appendChild(document.createTextNode(" ... "));
	return d;
}

module.exports={HTMLRangeViewer}
