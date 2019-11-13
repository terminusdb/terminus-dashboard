const TerminusClient = require('@terminusdb/terminus-client');

function SimpleGraph(){
	this.holder = document.createElement("div");	
}

SimpleGraph.prototype.setResult = function(result){
	this.result = result;
}

SimpleGraph.prototype.render = function(wgraph){
	this.graph = wgraph;
	TerminusClient.FrameHelper.removeChildren(this.holder);
	//var ctls = this.getControlsDOM(result);
	var tab = this.getGraphDOM(result);
	//if(ctls) this.holder.appendChild(ctls)
	this.holder.appendChild(tab);
	return this.holder;
}


SimpleGraph.prototype.getGraphDOM = function(){
	this.gviz = new GraphResultsViewer(this.options); 
	var gdom = this.gviz.getAsDOM();
	gdom.setAttribute("style", "border: 2px solid blue; width: 400px; height: 400px");
	this.result = result;
	this.gviz.setData(this);
	this.gviz.initDOM(gdom);
	return gdom;
}

module.exports = SimpleGraph;