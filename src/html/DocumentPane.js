const TerminusClient = require('@terminusdb/terminus-client');
const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const UTILS = require('../Utils');
const HTMLFrameHelper = require('./HTMLFrameHelper');
const TerminusFrame = require("../viewer/TerminusFrame");
const Datatypes = require("./Datatypes");
const SimpleFrameViewer = require("./document/SimpleFrameViewer");


function DocumentPane(client){
	this.client = client;
	this.container = document.createElement('span');
    this.container.setAttribute('class', 'terminus-document-cont');
}

DocumentPane.prototype.loadDocument = function(docid, config){
	this.docid = docid;
	this.clsid = false;
	this.view = config;
	this.frame = new TerminusFrame(this.client).options(this.view);
	this.frame.owner = this;
	this.frame.setDatatypes(Datatypes.initialiseDataRenderers);
	return this.frame.loadDocument(docid);
}

DocumentPane.prototype.loadClass = function(cls, config){
	this.clsid = cls;
	this.docid = false;
	this.view = config;
	this.frame = new TerminusFrame(this.client).options(this.view);
	this.frame.owner = this;
	this.frame.setDatatypes(Datatypes.initialiseDataRenderers);
	return this.frame.loadDocumentSchema(cls).then(() => this.frame.document.fillFromSchema("_:"));
}



DocumentPane.prototype.setClassLoader = function(cloader){
	this.classLoader = cloader;
	if(this.queryPane){
		this.queryPane.appendChild(this.classLoader);
	}
	return this;
}

DocumentPane.prototype.options = function(opts){
	this.showQuery = (opts && typeof opts.showQuery != "undefined" ? opts.showQuery : false);
	this.showConfig = (opts && typeof opts.showConfig != "undefined" ? opts.showConfig : false);
	this.editConfig = (opts && typeof opts.editConfig != "undefined" ? opts.editConfig : false);
	this.intro = (opts && typeof opts.intro != "undefined" ? opts.intro : false);
	this.defaultResultView = { showConfig: false, editConfig: false };
	this.documentLoader = (opts && typeof opts.loadDocument != "undefined" ? opts.loadDocument : false);
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
		configspan.appendChild(ispan);
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
	TerminusClient.FrameHelper.removeChildren(this.resultDOM);
	if(this.frame && this.frame.render){
		var fpt = this.frame.render();
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
		nr.terminus = termframe;
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
    this.query = qObj;
    qObj.execute(this.client).then((results) => {
		var r = new TerminusClient.WOQLResult(results, qObj);
		this.result = r;
		this.refreshViews();
	})
}

module.exports = DocumentPane;
