const HTMLFrameHelper = require('./html/HTMLFrameHelper');
const TerminusClient = require('@terminusdb/terminus-client');
const QueryPane = require("./html/QueryPane");

function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.options = options;
	this.panes = [];
	this.meta = {};
	this.container = document.createElement("div");
	this.container.setAttribute("class", "terminus-query-page");    
	this.newPaneButton = document.createElement('button');
	this.newPaneButton.setAttribute('class', 'terminus-btn terminus-new-query-btn');
	this.newPaneButton.appendChild(document.createTextNode('New Query'));
	this.newPaneButton.addEventListener('click', () => this.getAsDOM());	    
}

TerminusQueryViewer.prototype.getAsDOM = function(q){
	let qpane = new QueryPane(this.ui.client, q);
	this.panes.push(qpane);
	this.container.appendChild(qpane.getAsDOM(this.ui));
	this.container.appendChild(this.newPaneButton);
	return this.container;
}

module.exports=TerminusQueryViewer
