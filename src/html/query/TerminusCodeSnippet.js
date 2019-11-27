const TerminusClient = require('@terminusdb/terminus-client');
const UTILS= require('../../Utils');

/*
qObj: WOQL object
width: width of snippet in px
height: height of snippet in px
*/
function TerminusCodeSnippet(language, mode, format, width, height, placeholder){
	this.language = (language ? language : "woql");//woql / rule
	this.mode = (mode ? mode : "view");
    this.width = (width ? width : 800);
	this.height = (height ? height : 300);
	this.placeholder = (placeholder ? placeholder : "");
    this.format = (format ? format : "js");
    this.formats = {'js': "WOQL.js", 'jsonld': "JSON-LD"};
    this.view_types = {'table': "Table", "graph": "Graph", "chooser": "Drop-down List", "stream": "Result Stream" };
    if(this.mode == 'view')
        this.snippet = document.createElement('pre');
    else {
    	this.snippet = document.createElement('textarea');
    	this.snippet.setAttribute("spellcheck", "false");
    }
}

TerminusCodeSnippet.prototype.setQuery = function(q){
	this.qObj = q;
	this.refreshContents();
}

TerminusCodeSnippet.prototype.serialise = function(query, format){
	if(format == "js"){
		return query.prettyPrint(4);
	}
	else {
		return JSON.stringify(query.json(), 0, 2);
	}
}

//parses a string encoding a woql in either json or js notation
TerminusCodeSnippet.prototype.parseText = function(text, format){
	try {
		var WOQL = TerminusClient.WOQL;
		if(format == "js"){
			var nw = eval(text);
			return nw;
		}
		else {
			var qval = JSON.parse(text);
			return WOQL.json(qval);
		}
	}
	catch(e){
		this.error = "Failed to parse Query " + e.toString();
		console.error(this.error);
		return false;
	}
}

TerminusCodeSnippet.prototype.getInputElement = function(){
	return this.snippet;
}

TerminusCodeSnippet.prototype.readInput = function(){
	if(this.mode == "edit") {
		this.qObj = this.parseText(this.snippet.value, this.format);
		return this.qObj;
	}
	return this.qObj;
}

TerminusCodeSnippet.prototype.get = function(){
	return this.readInput();
}

TerminusCodeSnippet.prototype.getAsDOM = function(){
    var scont = document.createElement('div');
    // query
    var snpc = document.createElement('div');
    snpc.setAttribute('style', 'display:table-caption; margin: 20px');
    if(this.placeholder)
		this.snippet.setAttribute("placeholder", this.placeholder);
    if(this.width && this.height)
		this.snippet.setAttribute("style", "width: "+ this.width +"px; height: "+ this.height + "px;");
    if(this.language == "woql"){
    	snpc.appendChild(this.getFormatButtons());
    }
    else {
    	snpc.appendChild(this.getViewTypeButtons());
    }
    if(this.qObj){
    	var serial = this.serialise(this.qObj, this.format);
    	if(this.mode == "edit"){
    		this.snippet.value = serial;
    	}
    	else {
    		this.snippet.appendChild(document.createTextNode(serial));
    	}
    }
    snpc.appendChild(this.snippet);
    if(this.mode == "edit"){
    	var actbtn = this.getSubmitButton();
    	snpc.appendChild(actbtn);
    }
    scont.appendChild(snpc);
    return scont;
}


TerminusCodeSnippet.prototype.getViewTypeButtons = function(){
    var bsp = document.createElement('span');
    bsp.setAttribute('class', 'terminus-snippet-panel');
    //if(this.width) bsp.setAttribute("style", "width: "+ this.width +"px;");
    for(f in this.view_types){
        var btn = document.createElement('button');
        btn.setAttribute('value', f);
        btn.setAttribute('class', 'terminus-snippet-button');
        btn.appendChild(document.createTextNode(this.view_types[f]));
        var self = this;
        btn.addEventListener('click', function(){
        	if(self.readInput()){
        		self.view = this.value;
        		self.refreshContents();
        	}
        	else {
        		alert(self.error);
        	}
        })
        bsp.appendChild(btn);
    }
    return bsp;
}

TerminusCodeSnippet.prototype.getFormatButtons = function(){
    var bsp = document.createElement('span');
    bsp.setAttribute('class', 'terminus-snippet-panel');
    //if(this.width) bsp.setAttribute("style", "width: "+ this.width +"px;");
    for(f in this.formats){
        var btn = document.createElement('button');
        btn.setAttribute('value', f);
        btn.setAttribute('class', 'terminus-snippet-button');
        btn.appendChild(document.createTextNode(this.formats[f]));
        var self = this;
        btn.addEventListener('click', function(){
        	if(self.readInput()){
        		self.format = this.value;
        		self.refreshContents();
        	}
        	else {
        		alert(self.error);
        	}
        })
        bsp.appendChild(btn);
    }
    return bsp;
}


TerminusCodeSnippet.prototype.getSubmitButton = function(){
    var actbtn = document.createElement('button');
    actbtn.setAttribute('class', 'terminus-btn');
    actbtn.setAttribute('type', 'submit');
    actbtn.appendChild(document.createTextNode('Submit Query'));
    actbtn.addEventListener('click', () => {
    	this.readInput();
    	this.submit(this.qObj);
    });
    return actbtn;
}

TerminusCodeSnippet.prototype.submit = function(){
	alert("Submitted " + JSON.stringify(this.qObj));
}


TerminusCodeSnippet.prototype.refreshContents = function(){
    TerminusClient.FrameHelper.removeChildren(this.snippet);
    if(!this.qObj) return;
	var serial = this.serialise(this.qObj, this.format);
	if(this.mode == "edit"){
		this.snippet.value = serial;
	}
	else {
		this.snippet.appendChild(document.createTextNode(serial));
	}
}

module.exports = TerminusCodeSnippet;
