const WOQLQuery = require('../query/WOQLQuery');
const Renderers = require('./ObjectRenderer');
const HTMLFrameHelper = require('./HTMLFrameHelper');


function TerminusDocumentViewer(ui, action, options){
	this.ui = ui;
	this.server = this.ui.server();
	this.db = this.ui.db();
	this.init();
	this.mode = (options && options.mode ? options.mode : "view");
	this.editor = (options && options.editor ? options.editor : false);
	this.load_schema = (options && options.load_schema ? options.load_schema : true);
	this.config_options = this.getBuiltInViewerOptions();
	this.options = (options ? options : this.config_options[action]);
	this.action = action;
	this.document = false;
}

TerminusDocumentViewer.prototype.init = function(){
	var wq = new WOQLQuery(this.ui.client, this.options, this.ui);
	var woql = wq.getClassMetaDataQuery();
	var self = this;
	self.classmeta = {};
	self.instancemeta = {};
	wq.execute(woql).then(function(wresult){
		if(wresult && wresult.hasBindings()){
			for(var i = 0; i<wresult.bindings.length; i++){
				var cls = HTMLFrameHelper.getVariableValueFromBinding("Element", wresult.bindings[i]);
				if(cls && typeof self.classmeta[cls] == "undefined"){
					self.classmeta[cls] = wresult.bindings[i];
				}
			}
			self.refreshPage();
		}
	})
	.catch(function(e){
		console.log(e);
	});
}

TerminusDocumentViewer.prototype.getInstanceMeta = function(elid){
	var self = this;
	if(self.instancemeta && typeof self.instancemeta[elid] != "undefined") return self.instancemeta[elid] ;
	var wq = new WOQLQuery(this.ui.client, this.options, this.ui);
	var woql = wq.getInstanceMeta(elid);
	return wq.execute(woql).then(function(wresult){
		if(wresult && wresult.hasBindings()){
			var res = wresult.bindings[0];
			return res;
		}
		return false;
	})
	.catch(function(e){
		console.log(e);
	});
}

TerminusDocumentViewer.prototype.getClassMeta = function(cls){
	if(typeof this.classmeta[cls]){
		return this.classmeta[cls];
	}
	return false;
}

TerminusDocumentViewer.prototype.loadCreateDocument = function(url){
	if(url){
		this.ui.showBusy("Fetching frame for document class " + url);
		var self = this;
		this.mode = "edit";
		this.page_config = "create";
		if(url.indexOf("/") == -1 && url.indexOf(":") == -1) {
			url = "schema:" + url;
		}
		return this.loadDocumentSchema(url)
		.then(function(response){
			self.ui.clearBusy();
			self.setLabel();
		})
		.catch(function(error) {
			console.error(error);
			self.ui.clearBusy();
			self.ui.showError(error);
		});
	}
}

TerminusDocumentViewer.prototype.loadDocument = function(url, cls){
	if(!url) return false;
	var self = this;
	if(url.substring(0,4) == "doc:"){
		url = url.substring(4);
	}
	this.page_config = "view";
	url = url.replace("/candidate", "/platform/document");
	this.ui.showBusy("Loading Document from " + url);
	return this.ui.client.getDocument(url, {"terminus:encoding": "terminus:frame"})
	.then(function(response){
		self.ui.clearBusy();
		self.loadDataFrames(response);
		self.setLabel();
		self.refreshPage();
		if(self.load_schema){
			self.loadDocumentSchema(self.document.cls).then(function(){ self.refreshPage()}).catch(function(e){console.error(e)});
		}
		return response;
	})
	.catch(function(error) {
		console.error(error);
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusDocumentViewer.prototype.loadDocumentSchema = function(cls){
	var self = this;
	var ncls = TerminusClient.FrameHelper.unshorten(cls);
	return this.ui.client.getClassFrame(false, ncls)
	.then(function(response){
		self.loadSchemaFrames(response, cls);
		self.refreshPage();
	});
}

TerminusDocumentViewer.prototype.deleteDocument = function(URL){
	this.document = false;
	var self = this;
	this.ui.showBusy("Deleting Document " + URL);
	return this.ui.client.deleteDocument(URL)
	.then(function(response){
		self.ui.clearBusy();
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusDocumentViewer.prototype.createDocument = function(id){
	var self = this;
	var extr = this.renderer.extract();
	var opts = { "terminus:encoding": "jsonld" };
	this.ui.showBusy("Creating document");
	return this.ui.client.createDocument(id, extr, opts)
	.then(function(response){
		self.ui.clearBusy();
		self.ui.showDocument(id);
	}).catch(function(error){
		self.ui.clearBusy();
		if(error.data && error.data['terminus:witnesses']){
			self.ui.showViolations(error.data['terminus:witnesses'], "instance");			
		}
		else {
			self.ui.showError(error);
		}
	});
}

TerminusDocumentViewer.prototype.updateDocument = function(){
	var durl = this.document.subjid;
	var extr = this.renderer.extract();
	var self = this;
	var opts = { "terminus:encoding": "jsonld" };
	this.ui.showBusy("Updating document " + durl);
	return this.ui.client.updateDocument(durl, extr, opts)
	.then(function(response){
		self.ui.clearBusy();
		self.ui.showDocument(durl);
	}).catch(function(error){
		self.ui.clearBusy();
		if(error.data && error.data['terminus:witnesses']){
			self.ui.showViolations(error.data['terminus:witnesses'], "instance");			
		}
		else {
			self.ui.showError(error);
		}
	});
}

TerminusDocumentViewer.prototype.loadDataFrames = function(dataframes, cls){
	if(!cls){
		if(this.document) cls = this.document.cls;
		else {
			if(dataframes && dataframes.length && dataframes[0] && dataframes[0].domain){
				cls = dataframes[0].domain;
			}
		}
	}
	if(cls){
		if(!this.document){
			this.document = new TerminusClient.ObjectFrame(cls, dataframes);
		}
		else {
			this.document.loadDataFrames(dataframes);
		}
	}
	else {
		console.log("Missing Class" + " " + "Failed to add dataframes due to missing class");
	}
}


TerminusDocumentViewer.prototype.loadSchemaFrames = function(classframes, cls){
	if(!cls){
		if(classframes && classframes.length && classframes[0] && classframes[0].domain){
			cls = classframes[0].domain;
		}
	}
	if(cls){
		if(!this.document){
			this.document = new TerminusClient.ObjectFrame(cls);
		}
		if(classframes){
			this.document.loadClassFrames(classframes);
			if(!this.document.subjid){
				this.document.newDoc = true;
				this.document.fillFromSchema("_:");
			}
		}
	}
	else {
		console.log("Missing Class", "Failed to add class frames due to missing class");
	}
}

TerminusDocumentViewer.prototype.render = function(){
	if(!this.renderer && this.document){
		if(this.page_config){
			this.options = this.getOptionsFromPageConfig(this.page_config);
		}
		try{
			this.renderer = new Renderers.ObjectRenderer(this.document, false, this.options);
			this.renderer.mode = this.mode;
			this.renderer.controller = this;
		}catch(e){
	 		console.error('TerminusDocumentViewer render',e.toString())
	 	}
	}
	if(this.renderer){
		return this.renderer.render();
	}
}

TerminusDocumentViewer.prototype.getBuiltInViewerOptions = function(){
	return FrameConfig;
}

TerminusDocumentViewer.prototype.getOptionsFromPageConfig = function(pageconf){
	if(typeof this.config_options[pageconf] == "object") {
		return this.config_options[pageconf];
	}
	return this.options;
}


TerminusDocumentViewer.prototype.getClient = function(){
	return this.ui.client;
}

TerminusDocumentViewer.prototype.extract = function(options){
	return this.renderer.extract();
}

TerminusDocumentViewer.prototype.getLabel = function(){
	var lab = (this.cls ? this.cls : false);
	if(!lab) lab = (this.docid ? this.docid : "Void");
	return lab;
}

TerminusDocumentViewer.prototype.setLabel = function(){
	if(this.document && this.labdom){
		TerminusClient.FrameHelper.removeChildren(this.labdom);
		var dfs = this.document.getDataFrames(TerminusClient.FrameHelper.getStdURL("rdfs", "label"));
		for(var i = 0; i< dfs.length; i++){
			var lab = dfs[i].get();
			if(lab) {
				this.labdom.appendChild(document.createTextNode(lab));
			}
		}
	}
}

TerminusDocumentViewer.prototype.refreshPage = function(){
	if(this.pagedom){
		TerminusClient.FrameHelper.removeChildren(this.pagedom);
		var rends = this.render();
		if(rends){
			this.pagedom.appendChild(rends);
		}
	}
}

TerminusDocumentViewer.prototype.getAsDOM = function(){
	var holder = document.createElement("div");
	holder.setAttribute("class", "terminus-document-holder");
	if(this.mode !== 'edit'){ // dont provide drop down on create mode
		this.controldom = document.createElement("div");
		this.controldom.setAttribute("class", "terminus-document-controller");
		if(Object.keys(this.config_options).length > 1)	this.controldom.appendChild(this.getDocumentPageControls());
		holder.appendChild(this.controldom);
	}
	this.pagedom = document.createElement("div");
	this.pagedom.setAttribute("class", "terminus-document-page");
	var rends = this.render();
	if(rends){
		this.pagedom.appendChild(rends);
	}
	holder.appendChild(this.pagedom);
	return holder;
}

TerminusDocumentViewer.prototype.getDocumentPageControls = function(){
	var dpc = document.createElement("select");
	dpc.setAttribute("class", "terminus-form-select terminus-document-config");
	for(var i in this.config_options){
		if(i === 'create') continue; // create docuemnt option from config is not taken in edit mode 
		var opt = document.createElement("option");
		opt.value = i;
		if(this.page_config == i){
			opt.selected = true;
		}
		opt.appendChild(document.createTextNode(this.config_options[i].label));
		dpc.appendChild(opt);
	}
	var self = this;
	dpc.addEventListener("change", function(){
		self.page_config = this.value;
		self.renderer = false;
		self.refreshPage();
	})
	return dpc;
}

module.exports=TerminusDocumentViewer
