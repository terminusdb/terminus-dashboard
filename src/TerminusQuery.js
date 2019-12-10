//const TerminusHTMLViewer = require('./html/TerminusHTMLViewer');
const TerminusClient = require('@terminusdb/terminus-client');
const QueryPane = require("./html/QueryPane");
const ScriptPane = require("./html/ScriptPane");
const DocumentPane = require("./html/DocumentPane");

function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.options = options;
	this.panes = [];
	this.new_pane = false;
	this.new_pane_type = false;
	this.meta = {};
	this.container = document.createElement("div");
	this.container.setAttribute("class", "terminus-query-page");   
}

TerminusQueryViewer.prototype.newPaneOptions = function(){ 
	var opts = {showQuery: true, 
		editQuery: true,
		showHeader: true, 
		addViews: true,
	//	viewers: []
	};
	//opts.viewers.push(new TerminusClient.WOQL.table());
	//opts.viewers.push(new TerminusClient.WOQL.graph());
	//opts.viewers.push(new TerminusClient.WOQL.chooser());
	//opts.viewers.push(new TerminusClient.WOQL.stream()); 
	return opts;
} 

TerminusQueryViewer.prototype.addQueryPane = function(){
	let qpane = new QueryPane(this.ui.client).options(this.newPaneOptions());
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

TerminusQueryViewer.prototype.setNewDocumentPaneDOM = function(){
	this.new_pane = new DocumentPane(this.ui.client).options({showQuery: true, editQuery: true});
	this.new_pane_type = "document";
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

TerminusQueryViewer.prototype.getNewPaneHeader = function(){
	var hdr = document.createElement("div");
	hdr.appendChild(this.getControlsDOM("new"));
	return hdr;
}


TerminusQueryViewer.prototype.getPanesDOM = function(q){
	var pdom = document.createElement("div");
	pdom.setAttribute("class", "terminus-query-panes");
	for(var i = 0; i<this.panes.length; i++){
		var pd = this.panes[i].getAsDOM();
		var qhdr = this.getPaneHeader();
		pd.prepend(qhdr);
		pdom.appendChild(pd);
	}
	if(!this.new_pane){
		this.new_pane = new QueryPane(this.ui.client).options(this.newPaneOptions());
	}
	var npd = this.new_pane.getAsDOM();
	var nqhdr = this.getNewPaneHeader();
	npd.prepend(nqhdr);
	pdom.appendChild(npd);
	return pdom;
}


TerminusQueryViewer.prototype.getControlsDOM = function(isnew){
	var c = document.createElement("div");
	c.setAttribute("class", "terminus-query-page-controls");    
	if(isnew == "new"){
		var newPaneButton = document.createElement('button');
		newPaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		newPaneButton.appendChild(document.createTextNode('WOQL Query'));
		//newPaneButton.addEventListener('click', () => this.addQueryPaneDOM());	    
		c.appendChild(newPaneButton);
		var newScriptButton = document.createElement('button');
		newScriptButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		newScriptButton.appendChild(document.createTextNode('Script'));
		//newScriptButton.addEventListener('click', () => this.addScriptPaneDOM());	    
		c.appendChild(newScriptButton);
		var newDocButton = document.createElement('button');
		newDocButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		newDocButton.appendChild(document.createTextNode('Document Query'));
		newDocButton.addEventListener('click', () => this.setNewDocumentPaneDOM());	    
		c.appendChild(newDocButton);
	}
	else {
		var savePaneButton = document.createElement('button');
		savePaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		savePaneButton.appendChild(document.createTextNode('Save'));
		c.appendChild(savePaneButton);
		var closePaneButton = document.createElement('button');
		closePaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		closePaneButton.appendChild(document.createTextNode('Close'));
		c.appendChild(closePaneButton);
		var collapsePaneButton = document.createElement('button');
		collapsePaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		collapsePaneButton.appendChild(document.createTextNode('Collapse'));		
		c.appendChild(collapsePaneButton);
	}
	return c;
}


module.exports=TerminusQueryViewer
