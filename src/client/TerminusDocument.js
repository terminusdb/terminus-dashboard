const WOQLQuery = require('../query/WOQLQuery');
const Renderers = require('./ObjectRenderer');
const HTMLFrameHelper = require('./HTMLFrameHelper');
const TerminusDBViewer = require('./TerminusDB');
const TerminusClient = require('@terminusdb/terminus-client');
const UTILS=require('../Utils');

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
	var self = this;
	this.ui.showBusy("Fetching jsonld format of selected document");
	this.ui.client.getDocument()
	.then(function(response){
		self.ui.clearBusy();
	    TerminusClient.FrameHelper.removeChildren(self.pagedom);
		var label = response['@id']; // get doc id
		var header = document.createElement('div');
		header.setAttribute('class', 'terminus-application-header');
		header.appendChild(document.createTextNode('jsonld format of ' + label));
		self.pagedom.appendChild(header);
	    var res = document.createElement('textarea');
	    self.pagedom.appendChild(res);
	    res.appendChild(document.createTextNode(JSON.stringify(response, undefined, 2)));
	    res.setAttribute('class', 'terminus-api-explorer-text-area');
	    UTILS.stylizeEditor(self.ui, res, 'auto', 'javascript');
	})
	.catch(function(e){
		self.ui.clearBusy();
		self.ui.showError(e);
		throw(err);
	});
}

TerminusDocumentViewer.prototype.getEncodingChooserDOM = function() {
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-create-doc terminus-document-creator terminus-form-horizontal terminus-control-group");
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-creator-buttons");
	var enc = document.createElement('select');
	enc.setAttribute('class', 'terminus-doc-config');
	var oframe = document.createElement('option');
	oframe.setAttribute('value', 'frame');
	oframe.appendChild(document.createTextNode('Frame'));
	enc.appendChild(oframe);
	var ojson = document.createElement('option');
	ojson.setAttribute('value', 'jsonld');
	ojson.appendChild(document.createTextNode('Jsonld'));
	enc.appendChild(ojson);
	nbuts.appendChild(enc);
	var self = this;
	enc.addEventListener('change', function(e){
		if(this.value == 'frame'){
			self.page_config = 'view';
			self.renderer = false;
			self.refreshPage();
		}
		else{
			self.getJsonLdViewer();
		}
	})
	var ccDOM = document.createElement("span");
	ccDOM.setAttribute("class", "create-document-list");
	ccDOM.appendChild(nbuts);
	scd.appendChild(ccDOM);
	return scd;
}

TerminusDocumentViewer.prototype.getDocumentChooserDOM = function(holder){
	var self = this;
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-get-doc terminus-document-chooser terminus-form-horizontal terminus-control-group");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label terminus-doc-control-label terminus-control-label-padding");
	//lab.appendChild(document.createTextNode("ID "));
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-doc-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document ID");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button terminus-doc-btn")
	nbut.setAttribute('title', 'Enter Document ID to view');
	var i = document.createElement('i');
	i.setAttribute('class', 'fa fa-check');
	nbut.appendChild(i);
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

TerminusDocumentViewer.prototype.getDocumentCreatorDOM = function(){
	var self = this;
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-create-doc terminus-document-creator terminus-form-horizontal terminus-control-group");
	// get dropdown with list of types
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-creator-buttons");
	var wq = new WOQLQuery(this.ui.client, {}, this.ui);
	var filter = wq.getConcreteDocumentClassPattern("v:Element");
	var termcc = new TerminusClassChooser(this.ui, filter);
	termcc.empty_choice = "Create Document of Type";
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			self.ui.showCreateDocument(new_class);
			termcc.choice = false;
		}
	}
	var tcdom = termcc.getAsDOM('terminus-class-select');
	// get input type
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-doc-value terminus-document-creator");
	dcip.setAttribute("placeholder", "Enter Document Type");
	var nbut = document.createElement("button");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-creator-label terminus-control-label terminus-control-label-padding");
	nbut.setAttribute('class', "terminus-control-button create-document-button terminus-doc-btn")
	var i = document.createElement('i');
	i.setAttribute('title', 'Input which document type to create');
	i.setAttribute('class', 'fa fa-check');
	nbut.appendChild(i);
	nbut.addEventListener("click", function(){
		if(dcip.value) self.ui.showCreateDocument(dcip.value);
	})
	var ccDOM = document.createElement("span");
	ccDOM.setAttribute("class", "create-document-list");
	ccDOM.appendChild(tcdom);
	ccDOM.appendChild(tcdom);
	ccDOM.appendChild(dcip);
	ccDOM.appendChild(nbut);
	scd.appendChild(ccDOM);
	return scd;
};

TerminusDocumentViewer.prototype.getListOfDocuments = function(holder){
	var lod = document.createElement('div');
	lod.setAttribute('class', 'terminus-list-of-doc');
	lod.appendChild(UTILS.getHeaderDom('List of Documents'))
	holder.appendChild(lod);
	this.dbViewer.getClassesDOM(holder);
}

TerminusDocumentViewer.prototype.getDocumentSubMenus = function(feature, ul, holder){
	var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
	var self = this;
	switch(feature){
		case 'get_document':
			a.appendChild(document.createTextNode('View Document'));
			// set selected nav after redrawMainPage and home page
			if((this.page_config == 'view') || (this.mode == 'home')){
				a.classList.add('terminus-submenu-selected');
				var sp = document.createElement('span');
				sp.setAttribute('class', 'terminus-display-flex');
				holder.appendChild(sp);
				this.getDocumentChooserDOM(sp);
				this.getDocumentControls(sp);
			}
			a.addEventListener('click', function(){
				TerminusClient.FrameHelper.removeChildren(holder);
				UTILS.setSelectedSubMenu(this);
				self.getDocumentChooserDOM(holder);
				self.getDocumentControls(holder);
				self.getListOfDocuments(holder);
			});
		break;
		case 'create_document':
			a.appendChild(document.createTextNode('Create Document'));
			// set selected nav after redrawMainPage
			if(this.page_config == 'create'){
				a.classList.add('terminus-submenu-selected');
				holder.appendChild(self.getDocumentCreatorDOM());
			}
			a.addEventListener('click', function(){
				TerminusClient.FrameHelper.removeChildren(holder);
				UTILS.setSelectedSubMenu(this);
				holder.appendChild(self.getDocumentCreatorDOM());
				self.getListOfDocuments(holder);
			});
		break;
		default:
			console.log('Invalid features in TerminusDocument');
		break;
	} // switch(feature)
	ul.appendChild(a);
}

TerminusDocumentViewer.prototype.loadDocumentHome = function(){
	var self = this;
	var ul = document.createElement('ul');
	ul.setAttribute('class','terminus-ul-horizontal');
	this.controldom.appendChild(ul);
	var holder = document.createElement('div');
	this.controldom.appendChild(holder);
	if(this.ui.showControl("get_document")) {
		this.getDocumentSubMenus('get_document', ul, holder);
	}
	if(this.ui.showControl("create_document")) {
	    this.getDocumentSubMenus('create_document', ul, holder);
	}
	if(this.mode == 'home'){
		// this is displayed in documents home page
		this.getListOfDocuments(holder);
	}
}

TerminusDocumentViewer.prototype.getDocumentControls = function(holder, doc){
	if(this.mode === 'view'){ // dont provide drop down on create mode
		var sp = document.createElement('span');
		sp.setAttribute('class', 'terminus-document-page-controls');
		holder.appendChild(sp);
		sp.appendChild(this.getEncodingChooserDOM());
		var dpc = document.createElement('button');
		dpc.setAttribute('class', 'terminus-btn terminus-document-config');
		dpc.appendChild(document.createTextNode('Edit'));
		var self = this;
		sp.appendChild(dpc);
		dpc.addEventListener("click", function(){
			self.page_config = "edit";
			self.renderer = false;
			self.refreshPage();
		})
	}
}

TerminusDocumentViewer.prototype.getAsDOM = function(){
	this.holder = document.createElement("div");
	this.controldom = document.createElement("div");
	this.controldom.setAttribute("class", "terminus-document-controls");
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

/*TerminusDocumentViewer.prototype.getAsDOMOriginal = function(){
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
}  */

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
