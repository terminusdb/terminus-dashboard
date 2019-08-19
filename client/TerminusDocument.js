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
	//FrameHelper.addURLPrefix("schema", this.server + "/" + this.db + "/ontology/main#");
	//FrameHelper.addURLPrefix("document", this.server + "/" + this.db + "/candidate/");
	var wq = new WOQLQuery(this.ui.client, this.options);
	var woql = wq.getClassMetaDataQuery();
	var self = this;
	self.classmeta = {};
	wq.execute(woql).then(function(wresult){
		if(wresult.hasBindings()){
			for(var i = 0; i<wresult.bindings.length; i++){
				var cls = wresult.bindings[i].Class;
				if(cls && typeof self.classmeta[cls] == "undefined"){
					self.classmeta[cls] = wresult.bindings[i];
				}
			}
		}
	})
	.catch(function(e){
		console.error(e);
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
	this.page_config = "views";

	if(url.indexOf("/") == -1 && url.indexOf(":") == -1) url = "docs:" + url;
	this.ui.showBusy("Loading Document from " + url);
	return this.ui.client.getDocument(url, {format: "frame"})
	.then(function(response){
		self.ui.clearBusy();
		self.loadDataFrames(response.result);
		self.setLabel();
		self.refreshPage();
		if(self.load_schema){
			return self.loadDocumentSchema(self.document.cls).then(function(){ self.refreshPage()}).catch(function(e){console.error(e)});			
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
	return this.ui.client.getClassFrame(false, cls)
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
	var opts = { format: "json", show_result: 2};
	this.ui.showBusy("Creating document");
	return this.ui.client.createDocument(id, extr, opts)
	.then(function(response){
		self.ui.clearBusy();
		self.ui.showDocument(response);
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});	
}

TerminusDocumentViewer.prototype.updateDocument = function(){
	var durl = this.document.subjid;
	var extr = this.renderer.extract();
	var self = this;
	var opts = {format: "json", editmode: "replace"};
	this.ui.showBusy("Updating document " + durl);
	return this.ui.client.updateDocument(durl, extr, opts)
	.then(function(response){
		self.ui.clearBusy();
		self.ui.showDocument(durl);
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
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
			this.document = new ObjectFrame(cls, dataframes);
		}
		else {
			this.document.loadDataFrames(dataframes);
		}
	}
	else {
		alert("Missing Class" + " " + "Failed to add dataframes due to missing class");
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
			this.document = new ObjectFrame(cls);
		}
		this.document.loadClassFrames(classframes);
		if(!this.document.subjid){
			this.document.newDoc = true;
			this.document.fillFromSchema("_:");
		}
	}
	else {
		this.error("Missing Class", "Failed to add class frames due to missing class");
	}
}

TerminusDocumentViewer.prototype.render = function(){
	if(!this.renderer && this.document){
		if(this.page_config){
			this.options = this.getOptionsFromPageConfig(this.page_config);
		}
		this.renderer = new ObjectRenderer(this.document, false, this.options);
		this.renderer.mode = this.mode;
		this.renderer.controller = this;
	}
	if(this.renderer){
		return this.renderer.render();
	}
}

TerminusDocumentViewer.prototype.getBuiltInViewerOptions = function(){
	var opts = {
		view: {
			label: "View Document",
			load_schema: false, //should we load the document schema or just use the document frame
			editor: true,
			facet: "page",
			mode: "view",
			viewer: "html",
			hide_disabled_buttons: true,
			features: ["body", "id", "type", "summary", "status", "label", "facet", "control", "viewer", "view", "comment"],
			controls: ["mode"],
			rules: [{
				match: { type: "property"},
				mode: "edit"
			}]			
		},
		edit: {
			label: "Edit Document",
			load_schema: true, //should we load the document schema or just use the document frame
			editor: true,
			facet: "page",
			mode: "edit",
			viewer: "html"			
		},
		create: {
			label: "Create Document",
			features: ["body", "id", "type", "summary", "status", "label", "facet", "control", "viewer", "view", "comment"],
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"],
			editor: true,
			facet: "page",
			mode: "edit",
			viewer: "html"			
		},
		model: {
			label: "View Class Frame",
			features: ["body", "type", "label", "comment"],
			controls: [],
			editor: true,
			facet: "page",
			mode: "view",
			viewer: "html"			
		},
		expert: {
			label: "Expert Mode",
			features: ["body", "id", "type", "summary", "status", "label", "facet", "control", "viewer", "view", "comment"],
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"],
			editor: true,
			facet: "page",
			mode: "edit",
			viewer: "html"						
		}
	}
	return opts;
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
		FrameHelper.removeChildren(this.labdom);
		var dfs = this.document.getDataFrames(FrameHelper.getStdURL("rdfs", "label"));
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
		FrameHelper.removeChildren(this.pagedom); 
		var rends = this.render();
		if(rends){
			this.pagedom.appendChild(rends);
		}
	}
}

TerminusDocumentViewer.prototype.getAsDOM = function(){
	var holder = document.createElement("div");
	holder.setAttribute("class", "terminus-document-holder");
	this.controldom = document.createElement("div");
	this.controldom.setAttribute("class", "terminus-document-controller");
	this.controldom.appendChild(this.getDocumentPageControls());
	this.pagedom = document.createElement("div");
	this.pagedom.setAttribute("class", "terminus-document-page");
	var rends = this.render();
	if(rends){
		this.pagedom.appendChild(rends);
	}
	holder.appendChild(this.controldom);
	holder.appendChild(this.pagedom);
	return holder;
}

TerminusDocumentViewer.prototype.getDocumentPageControls = function(){
	var dpc = document.createElement("select");
	dpc.setAttribute("class", "terminus-form-select terminus-document-config");
	for(var i in this.config_options){
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

