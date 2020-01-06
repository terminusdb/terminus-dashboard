const TerminusClient = require('@terminusdb/terminus-client');
const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const UTILS = require('../Utils');
const HTMLHelper = require('./HTMLHelper');


function ScriptPane(client, script){
	this.client = client;
	this.script = (script ? script : "");
	this.container = document.createElement('div');
    this.container.setAttribute('class', 'terminus-script-pane-cont');
}

ScriptPane.prototype.empty = function(){
	return this.script == "";
}


ScriptPane.prototype.createInput = function(ui){
	let input = new TerminusCodeSnippet("code", "edit");
	if(this.script){
		input.setQuery(this.script);
	}
	var self = this;
	input.submit = function(qObj){
		self.executeScript(qObj, ui);
	};
	return input;
}


ScriptPane.prototype.executeScript = function(script, ui){
    if(ui) ui.clearMessages();
    this.script = script;
	var client = this.client;
	var WOQL = TerminusClient.WOQL;
	try {
		var res = eval(script);
		if(res){
			this.updateResult(res);
		}
		else {
			//executed ok message 
		}
	}
	catch(e){
		if(ui) ui.showError(e);
		console.error(e);
	}
}

ScriptPane.prototype.showOKMessage = function(){
    var msg = document.createTextNode("Script executed ok");
    this.updateResult(msg);
}

ScriptPane.prototype.updateResult = function(res){
    HTMLHelper.removeChildren(this.resultDOM);
    this.resultDOM.appendChild(res);
}


ScriptPane.prototype.getAsDOM = function(ui){
	this.container.appendChild(UTILS.getHeaderDom('Enter Script'));
	this.input = this.createInput(ui);
	this.container.appendChild(this.input.getAsDOM());
	this.resultDOM = document.createElement("div");
	this.resultDOM.setAttribute("class", "terminus-script-results"); 
	//var form = (this.input.format == "js" ? "javascript" : "json");
	//UTILS.stylizeEditor(ui, this.input.snippet, {width: this.input.width, height: this.input.height}, form);
	if(this.result){
        this.resultDOM.appendChild(this.result);
    }
	this.container.appendChild(this.resultDOM);
	return this.container;
}


module.exports = ScriptPane;
