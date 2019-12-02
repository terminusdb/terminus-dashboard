const WOQLQuery = require('./client/WOQLQuery');
const Renderers = require('./client/ObjectRenderer');
const HTMLFrameHelper = require('./html/HTMLFrameHelper');
const TerminusDBViewer = require('./TerminusDB');
const TerminusHTMLViewer = require('./html/TerminusHTMLViewer');
const TerminusClient = require('@terminusdb/terminus-client');
const UTILS=require('./Utils');

function TerminusDocumentViewer(ui, action, options){
	this.ui = ui;
	this.server = this.ui.server();
	this.db = this.ui.db();
	this.init();
	this.page_config = (options && options.page_config ? options.page_config : "view");
	this.mode = (options && options.mode ? options.mode : "view");
	this.editor = (options && options.editor ? options.editor : false);
	this.load_schema = (options && options.load_schema ? options.load_schema : true);
	this.config_options = this.getBuiltInViewerOptions();
	this.options = (options ? options : this.config_options[action]);
	this.action = action;
	this.document = false;
	this.dbViewer = new TerminusDBViewer.TerminusDBViewer(this.ui);
}

TerminusDocumentViewer.prototype.init = function(){
	const tbv = new TerminusDBViewer.TerminusDBViewer(this.ui);
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

TerminusDocumentViewer.prototype.getJsonLdViewer = function(){
	switch(this.page_config){
		case 'view':
			var self = this;
			this.ui.client.getDocument()
			.then(function(response){
				self.ui.clearBusy();
			    TerminusClient.FrameHelper.removeChildren(self.pagedom);
				var label = response['@id']; // get doc id
				var header = document.createElement('div');
				header.setAttribute('class', 'terminus-application-header');
				header.appendChild(document.createTextNode('jsonld format of ' + label));
				self.pagedom.appendChild(header);
			    var res = document.createElement('pre');
				self.document_json_response = response;
				res.innerHTML = JSON.stringify(response, undefined, 2);
			    res.setAttribute('class', 'terminus-api-explorer-text-area');
				UTILS.stylizeCodeDisplay(self.ui, res, self.pagedom, 'javascript');
			})
			.catch(function(e){
				self.ui.clearBusy();
				throw(e);
			});
		break;
		case 'create':
			TerminusClient.FrameHelper.removeChildren(this.pagedom);
			var header = document.createElement('div');
			header.setAttribute('class', 'terminus-application-header');
		 	var ohv = new ObjectViewer.HTMLObjectHeaderViewer();
			header.appendChild(ohv.getObjectIDDOM(this.renderer));
			//header.appendChild(document.createTextNode('Create new document in jsonld format'));
			header.appendChild(this.getDocumentJsonldCreateButton());
			this.pagedom.appendChild(header);
			var res = document.createElement('textarea');
			this.json_editor = res;
			this.pagedom.appendChild(res);
			res.setAttribute('class', 'terminus-api-explorer-text-area');
			UTILS.stylizeEditor(this.ui, res, 'doc-json-create', 'javascript');
			break;
	}
}

TerminusDocumentViewer.prototype.getEncodingChooserDOM = function() {
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-document-creator terminus-form-horizontal terminus-control-group");
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-creator-buttons");
	var enc = document.createElement('select');
	enc.setAttribute('class', 'terminus-doc-config terminus-enc');
	var oframe = document.createElement('option');
	oframe.setAttribute('value', 'frame');
	oframe.appendChild(document.createTextNode('HTML'));
	enc.appendChild(oframe);
	var ojson = document.createElement('option');
	ojson.setAttribute('value', 'jsonld');
	ojson.appendChild(document.createTextNode('JSON-LD'));
	enc.appendChild(ojson);
	nbuts.appendChild(enc);
	var self = this;
	enc.addEventListener('change', function(e){
		self.viewMode = this.value;
		switch(self.page_config){
			case 'view':
				self.page_config = 'view';
				if(this.value == 'frame'){
					self.renderer = false;
					self.refreshPage();
				}
				else self.getJsonLdViewer();
			break;
			case 'create':
				self.page_config = 'create';
				if(this.value == 'frame'){
					self.renderer = false;
					self.refreshPage();
				}
				else self.getJsonLdViewer();
			break;
		}
	})
	var ccDOM = document.createElement("span");
	ccDOM.setAttribute("class", "create-document-list");
	ccDOM.appendChild(nbuts);
	scd.appendChild(ccDOM);
	return scd;
}
/*
TerminusDocumentViewer.prototype.getDocumentChooserDOM = function(holder){
	var self = this;
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-get-doc terminus-document-chooser terminus-form-horizontal terminus-control-group");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label terminus-doc-control-label terminus-control-label-padding");
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-doc-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "doc:myDocId");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button terminus-btn");
	nbut.appendChild(document.createTextNode('View'));
	nbut.addEventListener("click", function(){
		if(dcip.value) {
			self.ui.showDocument(dcip.value);
		}
	})
	if(this.ui.client.connectionConfig.platformEndpoint() && this.ui.pluginAvailable("select2")){
		var mcls = TerminusClient.FrameHelper.unshorten("tcs:Document");
		var d2ch = new TerminusDocumentChooser(this.ui, mcls);
		d2ch.change = function(val){
			self.ui.showDocument(val);
		}
		d2ch.view = "label";
		var sdom = d2ch.getAsDOM('terminus-class-select');
		jQuery(dcip).hide();
		jQuery(nbut).hide();
		var nlab = document.createElement("a");
		nlab.setAttribute("href", "#");
		nlab.setAttribute("class", "terminus-document-which-chooser");
		nlab.appendChild(document.createTextNode("Choose by ID"));
		var show = "label";
		jQuery(nlab).click(function(){
			if(show == "label"){
				show = "id";
				jQuery(dcip).show();
				jQuery(nbut).show();
				jQuery(sdom).hide();
				jQuery(nlab).text("Choose by Label");
			}
			else {
				show = "label";
				jQuery(dcip).hide();
				jQuery(nbut).hide();
				jQuery(sdom).show();
				jQuery(nlab).text("Choose by ID");
			}
		})
		scd.appendChild(sdom);
		scd.prepend(nlab);
	}
	var nbuts = document.createElement("span");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-chooser-buttons");
	nbuts.appendChild(nbut);
	scd.appendChild(lab);
	scd.appendChild(dcip);
	scd.appendChild(nbuts);
	holder.appendChild(scd);
};
*/

TerminusDocumentViewer.prototype.getDocumentInput = function(d){
	var span = document.createElement('div');
	span.setAttribute('class', 'terminus-display-flex')
	var inp = document.createElement('input');
	inp.setAttribute('class', 'terminus-form-doc-value terminus-document-chooser terminus-doc-input-text');
	inp.setAttribute('placeholder', 'doc:myDocId');
	var vbtn = document.createElement('button');
	vbtn.appendChild(document.createTextNode('Create'));
	vbtn.setAttribute('class', 'terminus-control-button terminus-document-button terminus-btn');
	vbtn.addEventListener('click', function(){
		if(this.value) self.ui.showDocument(this.value);
	})
	span.appendChild(inp);
	span.appendChild(vbtn);
	d.appendChild(span);
}

TerminusDocumentViewer.prototype.showCreateDocument = function(dType){
	this.ui.showCreateDocument(dType);
}

TerminusDocumentViewer.prototype.styleCreateDocumentChooser = function(){
	var select = document.getElementsByClassName('woql-chooser');
	for(i=0; i<select.length; i++){
		if(select[i].type == 'select-one'){
			select[i].classList.add('terminus-form-doc-value');
			var self = this;
			select[i].addEventListener('change', function(){
				self.showCreateDocument(this.value);
			})
		}
	}
}

TerminusDocumentViewer.prototype.getCreateDocumentButton = function(d){
	var cbtn = document.createElement('button');
	cbtn.setAttribute('class', 'terminus-btn');
	cbtn.appendChild(document.createTextNode('Create'));
	var self = this;
	cbtn.addEventListener("click", function(){
		if(this.value) self.ui.showCreateDocument(this.value);
	})
	d.appendChild(cbtn);
}

TerminusDocumentViewer.prototype.getDocumentCreatorSelect = function(d){
	let nq = new TerminusHTMLViewer(this.ui.client);
	let WOQL = TerminusClient.WOQL;
	let query = WOQL.from(this.ui.client.connectionConfig.dbURL())
					.start(0)
					.concreteClass();
    var self = this;
	query.execute(this.ui.client).then((results) => {
		let qres = new TerminusClient.WOQLResult(results, query);
		var phr = 'Create Document of Type';
		var n = nq.showResult(qres, WOQL.chooser().show_empty(phr), false);
		d.appendChild(n);
		self.styleCreateDocumentChooser();
		self.getCreateDocumentButton(d);
	});
}

TerminusDocumentViewer.prototype.getDocumentCreatorDOM = function(dom){
	var span = document.createElement('span');
	span.setAttribute('class', 'terminus-display-flex terminus-create-document-align');
	this.getDocumentCreatorSelect(span);
	dom.appendChild(span);
}

TerminusDocumentViewer.prototype.getListOfDocuments = function(){
	this.dbViewer.getClassesDOM(this.controldom);
}

TerminusDocumentViewer.prototype.loadDocumentHome = function(){
	var controls = document.createElement('span');
	controls.setAttribute('class', 'terminus-display-flex');
	this.controldom.appendChild(controls);
	if(this.ui.showControl("get_document")){
		this.getDocumentInput(controls);
		this.getListOfDocuments();
	}
    if(this.ui.showControl("create_document"))
		this.getDocumentCreatorDOM(controls);
}

TerminusDocumentViewer.prototype.styleToggleSwitch = function(btn){
	btn.classList.remove('terminus-btn');
	btn.classList.add('terminus-doc-btn-group');
}

TerminusDocumentViewer.prototype.getFormatButtons = function(){
	 var span = document.createElement('span');
	 span.setAttribute('class', 'terminus-display-flex terminus-format-button-align');
	 var hbtn = span.appendChild(UTILS.getButton('HTML'));
	 var jbtn = UTILS.getButton('JSON-LD');
	 this.styleToggleSwitch(hbtn);
	 this.styleToggleSwitch(jbtn);
	 hbtn.classList.add('terminus-doc-btn-selected'); // default view is HTML
	 this.format = 'HTML';
	 span.appendChild(hbtn);
	 span.appendChild(jbtn);
	 var self = this;
	 hbtn.addEventListener('click', function(){
		 self.format = this.value;
	 })
	 jbtn.addEventListener('click', function(){
		 self.format = this.value;
	 })
	 return span;
 }

TerminusDocumentViewer.prototype.getAsDOM = function(){
	this.holder = document.createElement("div");
	this.controldom = document.createElement("div");
	this.controldom.setAttribute("class", "terminus-document-controls");
	this.holder.appendChild(this.getFormatButtons());
	this.pagedom = document.createElement("div");
	this.pagedom.setAttribute("class", "terminus-document-viewer");
	this.loadDocumentHome();
	this.holder.appendChild(this.controldom);
	this.holder.appendChild(this.pagedom);
	return this.holder;
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

TerminusDocumentViewer.prototype.createDocument = function(id, extr){
	var self = this;
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
		self.page_config = 'home';
		return self.page_config;
	});
}

TerminusDocumentViewer.prototype.updateDocument = function(extr){
	var durl = this.document.subjid;
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
