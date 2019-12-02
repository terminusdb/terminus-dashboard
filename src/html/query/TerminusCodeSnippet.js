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
			if(this.language == "rule"){
				this.view = view;
				return view;
			}
			return nw;
		}
		else {
			var qval = JSON.parse(text);
			return WOQL.json(qval);
		}
	}
	catch(e){
		this.error = "Failed to parse Query " + e.toString() + " " + text;
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

TerminusCodeSnippet.prototype.getAsDOM = function(with_buttons){
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
    	if(with_buttons) snpc.appendChild(this.getViewTypeButtons());
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

TerminusCodeSnippet.prototype.changeRuleView = function(nview){
	this.snippet.value = "view = WOQL."+ nview + "()";
	this.readInput();
	this.submit(this.qObj);
}


TerminusCodeSnippet.prototype.getIconsDOM = function(){
    var bsp = document.createElement('span');
    bsp.setAttribute('class', 'terminus-snippet-icons');
    for(var i = 0; i<this.view_types.length; i++){
		var isp = document.createElement('span');
		var icon = document.createElement("i");
		icon.title = this.view_types[i].label;
		icon.setAttribute("class", this.view_types[i].icon);
		isp.appendChild(icon);
		isp.name = this.view_types[i].id;
		var self = this;
		isp.addEventListener('click', function(){
			if(!(self.view && self.view.type == this.name)){
				self.changeRuleView(this.name);
			}
		});
		isp.addEventListener('mouseover', function(){
			if(!(self.view && self.view.type == this.name)){
				this.style.cursor = "pointer";
			}
		});
		bsp.appendChild(isp);
    }
    return bsp;
}

TerminusCodeSnippet.prototype.getViewTypeButtons = function(){
    var bsp = document.createElement('span');
    bsp.setAttribute('class', 'terminus-snippet-panel');
    /*for(var i = 0; i<this.view_types.length; i++){
        var btn = document.createElement('button');
        btn.setAttribute('value', this.view_types[i].id);
        btn.setAttribute('class', 'terminus-snippet-button');
		btn.appendChild(document.createTextNode(this.view_types[i].label));
		var icon = document.createElement("i");
		icon.setAttribute("class", this.view_types[i].icon);
		btn.appendChild(icon);
        var self = this;
        btn.addEventListener('click', function(){
        	self.changeRuleView(this.value);
        })
        bsp.appendChild(btn);
    }*/
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
	var txt = "Submit";
	if(this.language == "WOQL"){
		txt = "Submit Query";
	}
	else if(this.language == "rule") {
		txt = "Update View";
	}
	else if(this.language == "code"){
		txt = "Run Script";
	}
    actbtn.appendChild(document.createTextNode(txt));
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
