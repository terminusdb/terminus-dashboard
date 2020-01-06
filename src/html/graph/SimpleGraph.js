const HTMLHelper = require('../HTMLHelper');
const GraphResultsViewer = require('./GraphResultsViewer');


function SimpleGraph(){
	this.holder = document.createElement("div");
}

SimpleGraph.prototype.setResult = function(result){
	this.result = result;
}

SimpleGraph.prototype.render = function(wgraph){
	this.graph = wgraph;
	HTMLHelper.removeChildren(this.holder);
	//var ctls = this.getControlsDOM(result);
	var tab = this.getGraphDOM(this.result);
	//if(ctls) this.holder.appendChild(ctls)
	this.holder.appendChild(tab);
	return this.holder;
}


SimpleGraph.prototype.getGraphDOM = function(){
	this.gviz = new GraphResultsViewer(this.graph.config);
	var gdom = this.gviz.getAsDOM();
	var h = this.graph.config.height() ? this.graph.config.height() : 800;
	var w = this.graph.config.width() ? this.graph.config.width() : 800;
	gdom.setAttribute("style", "border: 1px solid #aaa; width: " + w + "px; height: " + h + "px; " + this.graph.config.width() + "px");
	this.gviz.setData(this.graph);
	this.gviz.initDOM(gdom);
	return gdom;
}

module.exports = SimpleGraph;
