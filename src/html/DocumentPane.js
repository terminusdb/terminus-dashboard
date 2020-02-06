const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const UTILS = require('../Utils');
const HTMLHelper = require('./HTMLHelper');
//const TerminusFrame = require("../old/viewer/TerminusFrame");
const TerminusClient = require('@terminusdb/terminus-client');
const SimpleFrameViewer = require("./document/SimpleFrameViewer");
const Datatypes = require("./Datatypes");
const DatatypeRenderers = require("./DatatypeRenderers");


function DocumentPane(client, docid, clsid){
	this.client = client;
	this.container = document.createElement('span');
	this.container.setAttribute('class', 'terminus-document-cont');
	this.defaultPaneView = { showConfig: false, editConfig: false, intro: false, loadSchema: false };
	this.docid = (docid ? docid : false);
	this.clsid = (clsid ? clsid : false);
	this.datatypes = new DatatypeRenderers();
    //Datatypes.initialiseDataRenderers(this.datatypes);
}

DocumentPane.prototype.load = function(){
	if(this.docid || this.clsid){
		this.frame = new TerminusClient.DocumentFrame(this.client, this.view);
		this.frame.owner = this;
	}
	if(this.docid){
		return this.frame.load(this.docid, this.clsid)
		.then(() => this.filterFrame());
	}
	if(this.clsid){
		return this.frame.load(false, this.clsid).then(() => {
			this.frame.document.fillFromSchema("_:");
			this.filterFrame();
	});	
	}
	return Promise.reject("Either document id or class id must be specified before loading a document");
}

DocumentPane.prototype.options = function(opts){
	this.showQuery = (opts && typeof opts.showQuery != "undefined" ? opts.showQuery : false);
	this.showConfig = (opts && typeof opts.showConfig != "undefined" ? opts.showConfig : false);
	this.editConfig = (opts && typeof opts.editConfig != "undefined" ? opts.editConfig : false);
	this.intro = (opts && typeof opts.intro != "undefined" ? opts.intro : false);
	this.documentLoader = (opts && typeof opts.loadDocument != "undefined" ? opts.loadDocument : false);
	this.loadSchema = (opts && typeof opts.loadSchema != "undefined" ? opts.loadSchema : false);
	this.viewers = (opts && typeof opts.viewers != "undefined" ? opts.viewers : false);
    Datatypes.initialiseDataRenderers(this.datatypes, false, opts);
    return this;
}

DocumentPane.prototype.filterFrame = function(){
	var self = this;
	var myfilt = function(frame, rule){
		if(typeof rule.render() != "undefined"){
			frame.render = rule.render();
		}
		else {
			if(rule.renderer()){
				var renderer = self.loadRenderer(rule.renderer(), frame, rule.args);		
			}
			if(renderer && renderer.render){
				frame.render = function(fframe){
					return renderer.render(fframe);
				}
			}
		}
		if(rule.compare()){
			frame.compare = rule.compare();
		}
	}
	this.frame.applyRules(false, false, myfilt);
}

DocumentPane.prototype.loadDocument = function(docid, config){
	this.docid = docid;
	this.view = config;
	return this.load();
}

DocumentPane.prototype.loadClass = function(cls, config){
	this.clsid = cls;
	this.docid = false;
	this.view = config;
	return this.load();
}



DocumentPane.prototype.setClassLoader = function(cloader){
	this.classLoader = cloader;
	if(this.queryPane){
		this.queryPane.appendChild(this.classLoader);
	}
	return this;
}

DocumentPane.prototype.getQueryPane = function(){
	var pane = document.createElement("div");
	pane.setAttribute("class", "terminus-document-query");
	if(this.documentLoader){
		pane.appendChild(this.documentLoader);
	}
	if(this.classLoader){
		pane.appendChild(this.classLoader);
	}
	return pane;
}

DocumentPane.prototype.getAsDOM = function(){
	if(this.intro){
		this.container.appendChild(UTILS.getHeaderDom(this.intro));
	}
	var configspan = document.createElement("span");
	configspan.setAttribute("class", "pane-config-icons");
	this.container.appendChild(configspan);
	if(this.showQuery && (this.documentLoader || this.classLoader)){
		var ipdom = this.getQueryPane();
		var ispan = document.createElement("span");
		ispan.setAttribute("class", "document-pane-config");
		var ic = document.createElement("i");
		ispan.appendChild(ic);
		if(this.showQuery != "always") configspan.appendChild(ispan);
		var self = this;
		function showQueryConfig(){
			ispan.title="Click to Hide Query";
			ic.setAttribute("class", "fas fa fa-times-circle");
			if(configspan.nextSibling) self.container.insertBefore(ipdom, configspan.nextSibling);
			else self.container.appendChild(ipdom);
		}
		function hideQueryConfig(){
			ispan.title="Click to View Query";
            ic.setAttribute("class", "fas fa fa-search");
			self.container.removeChild(ipdom);
		}
		ispan.addEventListener("click", () => {
			if(this.showingQuery) hideQueryConfig();
			else showQueryConfig();
			this.showingQuery = !this.showingQuery;
		});
		showQueryConfig();
		if(this.showQuery == "icon") hideQueryConfig();
		this.queryPane = ipdom;
	}
	if(this.showConfig){
        this.showingConfig = (this.showConfig != "icon");
		var mode = (this.editConfig ? "edit" : "view");
		this.input = this.createInput(mode);
		var ndom = this.input.getAsDOM();
        var nspan = document.createElement("span");
        nspan.addEventListener('mouseover', function(){
            this.style.cursor = "pointer";
		});
		nspan.setAttribute("class", "result-pane-config");
		var nc = document.createElement("i");
		nspan.appendChild(nc);
		configspan.appendChild(nspan);
		var self = this;
		function showDocConfig(){
			nspan.title="Click to Hide View Configuration";
			nc.setAttribute("class", "fas fa fa-times-circle");
			if(configspan.nextSibling) self.container.insertBefore(ndom, configspan.nextSibling);
			else self.container.appendChild(ndom);
			//stylize only after ta or pre have been appended
			if((self.input.snippet.value) || (self.input.snippet.innerHTML))
				self.input.stylizeSnippet();
		}
		function hideDocConfig(){
			nspan.title="Click to View Configuration";
            nc.setAttribute("class", "fas fa fa-vial");
			self.container.removeChild(ndom);
		}
		nspan.addEventListener("click", () => {
			if(this.showingConfig) hideDocConfig();
			else showDocConfig();
			this.showingConfig = !this.showingConfig;
        });
        showDocConfig();
		if(this.showConfig == "icon") hideDocConfig();
	}
	this.resultDOM = document.createElement("span");
	this.resultDOM.setAttribute("class", "terminus-document-results");
	//var form = (this.input.format == "js" ? "javascript" : "json");
	//UTILS.stylizeEditor(ui, this.input.snippet, {width: this.input.width, height: this.input.height}, form);
	this.container.appendChild(this.resultDOM);
	this.renderResult();
	return this.container;
}

DocumentPane.prototype.renderResult = function(){
	if(this.resultDOM){
		HTMLHelper.removeChildren(this.resultDOM);
	}
	else {
		this.resultDOM = document.createElement("span");
		this.resultDOM.setAttribute("class", "terminus-document-results");
		//var form = (this.input.format == "js" ? "javascript" : "json");
		//UTILS.stylizeEditor(ui, this.input.snippet, {width: this.input.width, height: this.input.height}, form);
		this.container.appendChild(this.resultDOM);
	}
	if(this.frame && this.frame.document.render){
		var fpt = this.frame.document.render();
		if(fpt){
			this.resultDOM.appendChild(fpt);
		}
	}
}

DocumentPane.prototype.loadRenderer = function(rendname, frame, args, termframe){
	var evalstr = "new " + rendname + "(";
	if(args) evalstr += JSON.stringify(args);
	evalstr += ");";
	try {
		var nr = eval(evalstr);
		nr.frame = frame;
		nr.datatypes = this.datatypes;
		return nr;
	}
	catch(e){
		console.log("Failed to load " + rendname + e.toString());
		return false;
	}
}


DocumentPane.prototype.createInput = function(mode){
    let input = new TerminusCodeSnippet("rule", mode);
    if(this.view){
    	input.setQuery(this.view);
	}
	var self = this;
	input.submit = function(qObj){
		self.updateView(qObj);
	};
	return input;
}

DocumentPane.prototype.updateView = function(docview){
	this.view = docview;
	this.frame.options(this.view);
	if(this.input) this.input.setQuery(this.view);
	this.frame.applyRulesToDocument(this.frame.document, this.frame.config);
	this.frame.renderer = this.frame.document;
	this.renderResult();
}

DocumentPane.prototype.updateResult = function(result){
	this.result = result;
	this.updateQuery(result.query);
	this.refreshViews();
}

DocumentPane.prototype.empty = function(){
	return (typeof this.view == "undefined");
}

DocumentPane.prototype.clearMessages = function(){}
DocumentPane.prototype.showError = function(){}

DocumentPane.prototype.submitQuery = function(qObj){
	this.clearMessages();
	tdv.owner = this;
	tdv.setDatatypes(Datatypes.initialiseDataRenderers);
	tdv.loadDocument(id).then(() => {
		let dom = tdv.render();
		if(dom) holder.appendChild(dom);
	});
	return holder;   
}

module.exports = DocumentPane;
