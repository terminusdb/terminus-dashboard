const TerminusClient = require('@terminusdb/terminus-client');
const ScriptPane = require("./html/ScriptPane");
const HTMLHelper = require('./html/HTMLHelper');
const TerminusViewer = require("./html/TerminusViewer");

function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.tv = new TerminusViewer(ui.client);
	this.options = options;
	this.panes = [];
	this.new_pane = false;
	this.new_pane_type = false;
	this.meta = {};
	this.container = document.createElement("div");
	this.container.setAttribute("class", "terminus-query-page");   
}

TerminusQueryViewer.prototype.newPaneOptions = function(){ 
	var opts = {
		showQuery: "always", 
		editQuery: true,
		showHeader: true, 
		css: "terminus-full-query-pane"
	};
	return opts;
} 

TerminusQueryViewer.prototype.defaultResultOptions = function(){ 
	var opts = {
		showConfig: "icon", 
		editConfig: true,
		showHeader: false, 
		viewers: [new TerminusClient.View.graph()],
	};
	return opts;
} 

TerminusQueryViewer.prototype.getNewQueryPane = function(){
	let table = TerminusClient.View.table();
	let qpane = this.tv.getQueryPane(false, [table], false, [this.defaultResultOptions()], this.newPaneOptions());
	return qpane;
}

TerminusQueryViewer.prototype.addQueryPane = function(){
	var qpane = this.getNewQueryPane();
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
	let qpane = this.addQueryPane();
	this.addNewPaneDOM(qpane);
}

TerminusQueryViewer.prototype.setNewDocumentPaneDOM = function(){
	this.new_pane = this.tv.getDocumentPane();
	//this.new_pane = new DocumentPane(this.ui.client).options({showQuery: true, editQuery: true});
	this.new_pane_type = "document";
}

TerminusQueryViewer.prototype.addNewPaneDOM = function(qpane){
	var lpane = this.panes[this.panes.length-1];
	//if(lpane && lpane.empty()){
	//	this.panes[this.panes.length-1] = qpane;
	//	this.paneDOM.removeChild(this.paneDOM.lastChild)		 
	//}
	//else {
		this.panes.push(qpane);
	//}
	var qdom = qpane.getAsDOM();
	var qhdr = this.getPaneHeader();
	qdom.prepend(qhdr);
	this.paneDOM.appendChild(qdom);
}

TerminusQueryViewer.prototype.getAsDOM = function(q){
	HTMLHelper.removeChildren(this.container);
	if(!this.paneDOM) this.paneDOM = this.getPanesDOM();
	this.container.appendChild(this.paneDOM);
	this.controlDOM = this.getControlsDOM();
	//this.container.appendChild(this.controlDOM);
	var cont = document.createElement("span");
	cont.setAttribute("class", "terminus-new-query-pane");
	var newPaneButton = document.createElement('button');
		newPaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		newPaneButton.appendChild(document.createTextNode('Add New Query'));
		newPaneButton.addEventListener('click', () => this.addQueryPaneDOM());	   
	cont.appendChild(newPaneButton); 
	this.container.appendChild(cont);
	return this.container;
}

TerminusQueryViewer.prototype.getPanesDOM = function(q){
	this.panesDOM = document.createElement("div");
	this.panesDOM.setAttribute("class", "terminus-query-panes");
	for(var i = 0; i<this.panes.length; i++){
		var pd = this.panes[i].getAsDOM();
		var qhdr = this.getPaneHeader();
		pd.prepend(qhdr);
		this.panesDOM.appendChild(pd);
	}
	if(!this.new_pane){
		this.new_pane = this.getNewQueryPane();
	}
	var npd = this.new_pane.getAsDOM();
	var nqhdr = this.getNewPaneHeader();
	this.new_pane.headerDOM = nqhdr;
	this.new_pane.paneDOM = npd;
	npd.prepend(nqhdr);
	this.panesDOM.appendChild(npd);
	return this.panesDOM;
}

TerminusQueryViewer.prototype.removePane = function(pane, index){
	HTMLHelper.removeChildren(pane.paneDOM);
	pane.paneDOM.appendChild(pane.headerDOM);
	if(this.panes[i]){
		this.panes.splice(i, 1);
	}
}

TerminusQueryViewer.prototype.showPane = function(pane){
	//HTMLHelper.removeChildren(pane.paneDOM);
	//var pd = pane.getAsDOM();
	//var qhdr = this.getPaneHeader();
	//pd.prepend(qhdr);
	//pane.headerDOM = qhdr;	
}

TerminusQueryViewer.prototype.hidePane = function(pane){
	
}



TerminusQueryViewer.prototype.getPaneHeader = function(){
	var hdr = document.createElement("div");
	//hdr.appendChild(this.getControlsDOM());
	return hdr;
}

TerminusQueryViewer.prototype.getNewPaneHeader = function(){
	var hdr = document.createElement("div");
	//hdr.appendChild(this.getControlsDOM("new"));
	return hdr;
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
