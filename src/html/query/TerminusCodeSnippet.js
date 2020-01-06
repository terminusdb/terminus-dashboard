const TerminusClient = require('@terminusdb/terminus-client');
const UTILS = require('../../Utils');
const HTMLHelper = require("../HTMLHelper")
/*
qObj: WOQL object
width: width of snippet in px
height: height of snippet in px
*/
function TerminusCodeSnippet(language, mode, format, width, height, placeholder){
	this.language = (language ? language : "woql");//woql / rule
	this.mode = (mode ? mode : "view");
    this.width = (width ? width : 1200);
	this.height = (height ? height : 300);
	this.placeholder = (placeholder ? placeholder : "");
    this.format = (format ? format : "js");
    this.formats = {'js': "WOQL.js", 'jsonld': "JSON-LD"};
    if(this.mode == 'view')
        this.snippet = document.createElement('pre');
    else {
    	this.snippet = document.createElement('textarea');
    	this.snippet.setAttribute("spellcheck", "false");
		this.snippet.setAttribute("class", "terminus-code-snippet");
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
		return JSON.stringify(query.json(), undefined, 2);
	}
}

//parses a string encoding a woql in either json or js notation
TerminusCodeSnippet.prototype.parseText = function(text, format){
	try {
		var WOQL = TerminusClient.WOQL;
		var View = TerminusClient.View;
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
			if(this.language == "woql"){
				return WOQL.json(qval);
			}
			else {
				return View.loadConfig(qval);
			}
		}
	}
	catch(e){
		this.error = "Failed to parse Query " + e.toString() + " " + text;
		return this.error;
		//return false;
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
	scont.setAttribute('class', 'terminus-snippet-container')
    // query
    var snpc = document.createElement('div');
    if(this.placeholder){
		this.snippet.setAttribute("placeholder", this.placeholder);
	}
    snpc.appendChild(this.getFormatButtons());
    if(this.qObj){
    	var serial = this.serialise(this.qObj, this.format);
		if(this.mode == "edit"){
    		this.snippet.value = serial;
    	}
    	else {
    		this.snippet.appendChild(document.createTextNode(serial));
    	}
	}
	else {
		this.snippet.value = "";
	}
    snpc.appendChild(this.snippet);
    if(this.mode == "edit"){
		var ssb = document.createElement("span");
		ssb.setAttribute("class", "terminus-query-submit-buttons");
		var actbtn = this.getSubmitButton();
		ssb.appendChild(actbtn);
    	snpc.appendChild(ssb);
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

TerminusCodeSnippet.prototype.getFormatButtons = function(){
    var bsp = document.createElement('span');
    bsp.setAttribute('class', 'terminus-snippet-panel');
    //if(this.width) bsp.setAttribute("style", "width: "+ this.width +"px;");
    for(f in this.formats){
        var btn = document.createElement('button');
        btn.setAttribute('value', f);
        btn.setAttribute('class', 'terminus-snippet-button');
		if(f == 'js') btn.classList.add('terminus-snippet-format-selected');
        btn.appendChild(document.createTextNode(this.formats[f]));
        var self = this;
        btn.addEventListener('click', function(){
			UTILS.setSelected(this, 'terminus-snippet-format-selected');
			var qobj = self.parseText(self.snippet.value, self.format);
			self.format = this.value;
			if(qobj) self.qObj = qobj;
			self.refreshContents();
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

TerminusCodeSnippet.prototype.removeCodeMirror = function(){
	var cm = this.snippet.nextSibling;
	if(!cm) return;
	if(cm.classList.contains('CodeMirror')) // remove code mirror
	HTMLHelper.removeElement(cm);
}

TerminusCodeSnippet.prototype.stylizeSnippet = function(){
	var dimensions = "query";
	//dimensions.width = "1000";//this.width;
	//dimensions.height = "1000";//this.height;

	this.removeCodeMirror();
	if(this.mode == 'view')
		UTILS.stylizeCodeDisplay(null, this.snippet, null, 'javascript');
	else UTILS.stylizeEditor(null, this.snippet, dimensions, 'javascript'); // default view is js
}

TerminusCodeSnippet.prototype.refreshContents = function(qObj){
	qObj = qObj ? qObj : this.qObj;
	HTMLHelper.removeChildren(this.snippet);
	if(this.mode == "edit") this.snippet.value == "";
	if(!qObj) return;
	var serial = this.serialise(this.qObj, this.format);
	if(this.mode == "edit"){
		this.snippet.value = serial;
		if(this.snippet.nextSibling){
			this.removeCodeMirror();
			if(this.format == 'js') var mode = 'javascript';
			else var mode = 'application/ld+json';
			UTILS.stylizeEditor(null,
								this.snippet,
								{width: this.width, height: this.height},
								mode);
		}
	}
	else {
		this.snippet.appendChild(document.createTextNode(serial));
		UTILS.stylizeCodeDisplay(null, this.snippet, null, mode);
	}
}

module.exports = TerminusCodeSnippet;
