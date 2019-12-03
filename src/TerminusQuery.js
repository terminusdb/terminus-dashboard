//const TerminusHTMLViewer = require('./html/TerminusHTMLViewer');
const TerminusClient = require('@terminusdb/terminus-client');
const QueryPane = require("./html/QueryPane");
const ScriptPane = require("./html/ScriptPane");
const DocumentPane = require("./html/DocumentPane");

function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.options = options;
	this.panes = [];
	this.meta = {};
	this.container = document.createElement("div");
	this.container.setAttribute("class", "terminus-query-page");    
}

TerminusQueryViewer.prototype.addQueryPane = function(){
	let qpane = new QueryPane(this.ui.client).options({showQuery: true, editQuery: true});
	this.panes.push(qpane);
	return qpane;
}

TerminusQueryViewer.prototype.addScriptPane = function(q){
	let qpane = new ScriptPane(this.ui.client, q);
	this.panes.push(qpane);
	return qpane;
}

TerminusQueryViewer.prototype.addScriptPaneDOM = function(){
	let qpane = new ScriptPane(this.ui.client);
	this.addNewPaneDOM(qpane);
}

TerminusQueryViewer.prototype.addQueryPaneDOM = function(){
	let qpane = new QueryPane(this.ui.client).options({showQuery: true, editQuery: true});
	this.addNewPaneDOM(qpane);
}

TerminusQueryViewer.prototype.addDocumentPaneDOM = function(){
	let qpane = new DocumentPane(this.ui.client).options({showQuery: true, editQuery: true});
	this.addNewPaneDOM(qpane);
}

TerminusQueryViewer.prototype.addNewPaneDOM = function(qpane){
	var lpane = this.panes[this.panes.length-1];
	if(lpane && lpane.empty()){
		this.panes[this.panes.length-1] = qpane;
		this.paneDOM.removeChild(this.paneDOM.lastChild)		 
	}
	else {
		this.panes.push(qpane);
	}
	var qdom = qpane.getAsDOM();
	var qhdr = this.getPaneHeader();
	qdom.prepend(qhdr);
	this.paneDOM.appendChild(qdom);
}

TerminusQueryViewer.prototype.getAsDOM = function(q){
	TerminusClient.FrameHelper.removeChildren(this.container);
	if(!this.paneDOM) this.paneDOM = this.getPanesDOM();
	this.container.appendChild(this.paneDOM);
	this.controlDOM = this.getControlsDOM();
	this.container.appendChild(this.controlDOM);
	return this.container;
}

TerminusQueryViewer.prototype.getPaneHeader = function(){
	var hdr = document.createElement("div");
	hdr.appendChild(this.getControlsDOM());
	return hdr;
}

TerminusQueryViewer.prototype.getPanesDOM = function(q){
	var pdom = document.createElement("div");
	pdom.setAttribute("class", "terminus-query-panes");
	if(this.panes.length == 0){
		this.addQueryPane();
	}
	for(var i = 0; i<this.panes.length; i++){
		var pd = this.panes[i].getAsDOM();
		var qhdr = this.getPaneHeader();
		pd.prepend(qhdr);
		pdom.appendChild(pd);
	}    
	return pdom;
}


TerminusQueryViewer.prototype.getControlsDOM = function(q){
	var c = document.createElement("div");
	c.setAttribute("class", "terminus-query-page-controls");    
	var newPaneButton = document.createElement('button');
	newPaneButton.setAttribute('class', 'terminus-btn terminus-new-query-btn');
	newPaneButton.appendChild(document.createTextNode('New Query'));
	newPaneButton.addEventListener('click', () => this.addQueryPaneDOM());	    
	c.appendChild(newPaneButton);
	
	var newScriptButton = document.createElement('button');
	newScriptButton.setAttribute('class', 'terminus-btn terminus-new-script-btn');
	newScriptButton.appendChild(document.createTextNode('New Script'));
	newScriptButton.addEventListener('click', () => this.addScriptPaneDOM());	    
	c.appendChild(newScriptButton);
	var newDocButton = document.createElement('button');
	newDocButton.setAttribute('class', 'terminus-btn terminus-new-script-btn');
	newDocButton.appendChild(document.createTextNode('New Document View'));
	newDocButton.addEventListener('click', () => this.addDocumentPaneDOM());	    
	c.appendChild(newDocButton);
	
	return c;
}


module.exports=TerminusQueryViewer
