/**
 * Terminus UI object
 * Contains a client, a set of controls and a viewer -
 * passes requests to the client and viewer from the controls
 *
 * @param opts
 * @returns
 */
function TerminusUI(opts){
	this.client = new WOQLClient();
	this.viewer = new TerminusContentViewer(this, opts);
	this.default_install_url = "http://localhost:6363/";
	this.controls = [];
	this.setOptions(opts);
	//this.connections = {};
}

TerminusUI.prototype.setOptions = function(opts){
	this.show_controls = opts && opts.controls ? opts.controls : ["server", "db", "change-server", "create-db", "create-document", "document", "schema", "query"];
	this.show_views = opts && opts.views ? opts.views : ["dblist"];
	this.viewdoc_options = (opts && opts.viewdoc ? opts.viewdoc : {});
	this.createdoc_options = (opts && opts.createdoc ? opts.createdoc : {});
}

TerminusUI.prototype.getDocViewerOptions = function(){
	return this.viewdoc_options;
}

TerminusUI.prototype.getDocCreatorOptions = function(){
	return this.createdoc_options;
}


TerminusUI.prototype.removeDB = function(db, url){
	this.client.removeDBFromConnection(db, url);
}

TerminusUI.prototype.getDBRecord = function(db, url){
	return this.client.getDBRecord(db, url);
}

TerminusUI.prototype.connect = function(opts){
	var self = this;
	this.client.server = false;
	this.viewer.clear();
	var url = ((opts && opts.server) ? opts.server : this.default_install_url );
	var key = ((opts && opts.key) ? opts.key : false);
	this.showBusy("Connecting to server at " + url);
	return this.client.connect(url, key)
	.then( function(response) {
		self.clearBusy();
		if(opts && opts.db && typeof response[opts.db] != "undefined"){
			self.client.dbid = opts.db;
		}
		self.viewer.clearPages();
		if(self.client.dbid){
			if(opts.document){
				self.viewer.showDocument(opts.document);
			}
			else if(opts.schema){
				self.viewer.showSchemaPage(opts.schema);
			}
			else if(opts.query){
				self.viewer.showQueryPage(opts.query);
			}
			else {
				self.viewer.showDBMainPage();
			}
		}
		else {
			self.viewer.showServerMainPage();
		}
		self.redraw();
	})
	.catch(function(err) {
		self.redraw(err);
	});
}

TerminusUI.prototype.server = function(){
	return this.client.server;
}

TerminusUI.prototype.db = function(){
	return this.client.dbid;
}

TerminusUI.prototype.draw = function(comps){
	if(comps && comps.messages) this.setMessageDOM(comps.messages);
	if(comps && comps.controller) this.setControllerDOM(comps.controller);
	if(comps && comps.viewer) this.setViewerDOM(comps.viewer);
	if(this.controller){
		this.drawControls();
	}
	if(comps && comps.server && typeof this.client.connection[comps.server] == "undefined"){
		this.connect(comps);
	}
	if(this.viewer){
		return this.viewer.draw();
	}
}

TerminusUI.prototype.redraw = function(msg){
	this.clear();
	this.clearMessages();
	if(this.controller){
		this.drawControls();
	}
	if(this.viewer){
		this.viewer.draw();
	}
	if(msg) this.showMessage(msg);
};


TerminusUI.prototype.load = function(url, key){
	var args = {};
	if(url && url.indexOf("/document/") != -1){
		url = url.substring(0, url.indexOf("/document/"));
		args.document = url.substring(url.indexOf("/document/")+10);
	}
	else if(url && url.indexOf("/schema") != -1){
		url = url.substring(0, url.indexOf("/schema"));
		args.schema = {};
	}
	else if(url && url.indexOf("/query") != -1){
		url = url.substring(0, url.indexOf("/query"));
		args.query = url.substring(url.indexOf("/query")+7);
	}
	args.server = url;
	if(key) args.key = key;
	return this.connect(args);
}

TerminusUI.prototype.drawControls = function(){
	this.controls = [];
	this.loadControls();
	for(var i = 0; i<this.controls.length; i++){
		var ncontrol = this.controls[i];
		var nd = ncontrol.getAsDOM();
		if(nd) this.controller.appendChild(nd);
	}
}

TerminusUI.prototype.refreshDBList = function(){
	var self = this;
	return this.client.connect();
}

TerminusUI.prototype.getConnectionEndpoint = function(url){
	if(url && url.indexOf("/schema") != -1){
		return url.substring(0, url.indexOf("/schema"));
	}
	if(url && url.indexOf("/document") != -1){
		return url.substring(0, url.indexOf("/document"));
	}
	return url;
}

TerminusUI.prototype.clear = function(msg){
	if(this.controller){
		FrameHelper.removeChildren(this.controller);
	}
	if(this.viewer){
		this.viewer.clear(msg);
	}
}

TerminusUI.prototype.setControllerDOM = function(dom){
	this.controller = dom;
}

TerminusUI.prototype.setViewerDOM = function(dom){
	this.viewer.setDOM(dom);
}

TerminusUI.prototype.setMessageDOM = function(dom){
	this.messages = dom;
}

TerminusUI.prototype.deleteDatabase = function(dbid){
	var self = this;
	var delrec = this.client.getDBRecord();
	var lid = (dbid ? dbid : this.db());
	var dbn = (delrec && delrec['rdfs:label'] && delrec['rdfs:label']["@value"] ? delrec['rdfs:label']["@value"] + " (id: " + lid + ")" : lid);
	this.showBusy("Deleting database " + dbn);
	return this.client.deleteDatabase(dbid)
	.then(function(response){
		self.clearBusy();
		self.client.dbid = false;
		self.removeDB(dbid);
		self.viewer.showServerMainPage();
		self.redraw("Successfully Deleted Database " + dbn);
		self.refreshDBList();
		return response;
	})
	.catch(function(error){
		self.clearBusy();
		self.showError(error);
	});
}

TerminusUI.prototype.createDatabase = function(dbdets){
	var self = this;
	var dbid = dbdets.id;
	self.showBusy("Creating Database " + dbdets.title + " with id " + dbid);
	var dbdoc = this.generateNewDatabaseDocument(dbdets);
	return this.client.createDatabase(dbid, dbdoc)
	.then(function(response){ //import schema into newly created DB
		if(dbdets.schema){
			self.showBusy("Fetching imported schema from " + dbdets.schema);
			var opts = (dbdets.key ?  {key: dbdets.key } : {});
			return self.client.getSchema(dbdets.schema, opts)
			.then(function(response){
				self.showBusy("Updating database with new schema");
				return self.client.updateSchema(false, response);
			})
			.then(function(response){
				self.clearBusy();
				return response;
			});
		}
		else {
			self.clearBusy();
		}
		return response;
	})
	.then(function(response){ //reload list of databases in background..
		self.refreshDBList();
		return response;
	})
	.then(function(response){
		self.client.dbid = dbid;
		self.viewer.showDBMainPage();
		self.redraw("Successfully Created Database " + dbid);
	})
	.catch(function(error){
		self.clearBusy();
		self.showError(error);
	});
}

TerminusUI.prototype.generateNewDatabaseDocument = function(dets){
	var doc = {
		"@context" : {
			rdfs: "http://www.w3.org/2000/01/rdf-schema#",
			terminus: "https://datachemist.net/ontology/terminus#"
		},
		"@type": "terminus:Database"
	}
	if(dets.title){
		doc['rdfs:label'] = {
			"@language":  "en",
			"@value": dets.title
		};
	}
	if(dets.description){
		doc['rdfs:comment'] = {
			"@language":  "en",
			"@value": dets.description
		};
	}
	doc['terminus:allow_origin'] = { "@type" : "xsd:string", "@value" : "*" };
	return doc;
}

TerminusUI.prototype.showMessage = function(msg){
	if(this.messages){
		this.messages.appendChild(document.createTextNode(msg));
	}
};

TerminusUI.prototype.showBusy = function(msg){
	this.showMessage(msg);
	return this.viewer.busy(msg);
};

TerminusUI.prototype.showError = function(response){
	this.showMessage(response);
};

TerminusUI.prototype.clearMessages = function(response){
	if(this.messages) FrameHelper.removeChildren(this.messages);
};

TerminusUI.prototype.showResult = function(response){
	alert("result");
};

TerminusUI.prototype.clearBusy = function(response){
	this.clearMessages();
	return this.viewer.busy(false);
}

TerminusUI.prototype.loadControls = function(){
	if(this.showControl('server')){
		var sc = new TerminusServerController(this);
		if(sc) this.controls.push(sc);
		if(this.db && this.showControl("db")){
			var sc = new TerminusDBController(this);
			if(sc) this.controls.push(sc);
		}
	}
}

TerminusUI.prototype.showControl = function(el){
	if(this.show_controls.indexOf(el) == -1) return false;
	return true;
}

TerminusUI.prototype.showView = function(el){
	if(this.show_views.indexOf(el) == -1) return false;
	return true;
}

TerminusUI.prototype.loadDocument = function(durl){
	this.clearMessages();
	this.viewer.showDocument(durl);
}

TerminusUI.prototype.showCreateDocument = function(durl){
	this.clearMessages();
	this.viewer.showCreateDocument(durl);
}

TerminusUI.prototype.getControlsDOM = function(){
	var ctrlsdom = document.createElement("span");
	ctrlsdom.setAttribute("class", "ui-controls");
	for(var i = 0; i<this.controls.length; i++){
		var cdom = this.controls[i].getAsDOM();
		if(cdom){
			ctrlsdom.appendChild(cdom);
		}
	}
	return ctrlsdom;
}

/**
 * Generates server context events - load main server page, load new url page
 */
 function TerminusServerController(ui){
	 this.ui = ui;
 }

TerminusServerController.prototype.showLoader = function(){
	this.ui.viewer.showLoadURLPage();
	if(this.ui.db){
		this.ui.client.dbid = false;
	}
	//this.ui.redraw();
}

TerminusServerController.prototype.showServer = function(){
	this.ui.viewer.showServerMainPage();
	if(this.ui.db){
		this.ui.client.dbid = false;
	}
	else {
		this.ui.clearMessages();
	}
	this.ui.redraw();
}

TerminusServerController.prototype.showCreateDB = function(){
	this.ui.viewer.showCreateDBPage();
	if(this.ui.db){
		this.ui.client.dbid = false;
		this.ui.redraw();
	}
	else {
		this.ui.clearMessages();
		this.ui.viewer.redraw();
	}
}

TerminusServerController.prototype.getAsDOM = function(){
	var rsc = document.createElement("span");
	rsc.setAttribute("class", "server-controller");
	var self = this;
	if(this.ui && this.ui.server()){
		var scd = document.createElement("span");
		scd.setAttribute("class", "server-connection");
		var lab = document.createElement("span");
		lab.setAttribute("class", "server-label");
		lab.appendChild(document.createTextNode("Server"));
		scd.appendChild(lab);
		scd.appendChild(this.getServerLabelDOM());
		scd.addEventListener("click", function(){
			self.showServer();
		})
		rsc.appendChild(scd);
		if(this.ui.showControl("change-server")){
			var csbut = document.createElement("button");
			csbut.setAttribute("class", "reg-contol-button change-server-button")
			csbut.appendChild(document.createTextNode("Change Server"));
			csbut.addEventListener("click", function(){
				self.showLoader();
				self.ui.redraw();
			})
			rsc.appendChild(csbut);
		}
		if(this.ui.showControl("create-db")){
			var crbut = document.createElement("button");
			crbut.setAttribute("class", "reg-contol-button create-db-button")
			crbut.appendChild(document.createTextNode("Create New Database"));
			crbut.addEventListener("click", function(){
				self.showCreateDB();
			})
			rsc.appendChild(crbut);
		}
	}
	else {
		this.showLoader();
	}
	return rsc;
}

TerminusServerController.prototype.getServerLabelDOM = function(){
	var srec = this.ui.client.getServerRecord();
	var lab = (srec && srec['rdfs:label'] && srec['rdfs:label']["@value"] ? srec['rdfs:label']["@value"] : this.ui.server());
	var desc = (srec && srec['rdfs:comment'] && srec['rdfs:comment']["@value"] ? srec['rdfs:comment']["@value"] : "");
	desc += " Server URL: "+ this.ui.server();
	var val = document.createElement("span");
	val.setAttribute("class", "server-value");
	val.setAttribute("title", desc);
	val.appendChild(document.createTextNode(lab));
	return val;
}




/*
 * Generates events related to DB context
 * view document etc
 */
 function TerminusDBController(ui){
	 this.ui = ui;
	 this.db = this.ui.db();
 }

TerminusDBController.prototype.showDB = function(){
	this.ui.clearMessages();
	this.ui.viewer.showDBMainPage();
	this.ui.viewer.redraw();
}

TerminusDBController.prototype.deleteDB = function(){
	this.ui.deleteDatabase(this.db);
}

TerminusDBController.prototype.showSchema = function(){
	this.ui.clearMessages();
	this.ui.viewer.showSchemaPage();
	this.ui.viewer.redraw();
}

TerminusDBController.prototype.showDocument = function(durl){
	this.ui.loadDocument(durl);
	this.ui.viewer.redraw();
}

TerminusDBController.prototype.showQuery = function(){
	this.ui.clearMessages();
	this.ui.viewer.showQueryPage();
	this.ui.viewer.redraw();
}

TerminusDBController.prototype.showCreateDocument = function(durl){
	this.ui.showCreateDocument(durl);
	this.ui.viewer.redraw();
}

TerminusDBController.prototype.getAsDOM = function(){
	var self = this;
	var dbc = document.createElement("span");
	dbc.setAttribute("class", "db-controller");
	if(this.ui && this.db){
		var scd = document.createElement("span");
		scd.setAttribute("class", "db-connection");
		var lab = document.createElement("span");
		lab.setAttribute("class", "db-label");
		lab.appendChild(document.createTextNode("DB"));
		var val = document.createElement("span");
		val.setAttribute("class", "db-value");
		var dbrec = this.ui.client.getDBRecord();
		var nm = (dbrec && dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.db);
		val.appendChild(document.createTextNode(nm));
		scd.appendChild(lab);
		scd.appendChild(val);
		scd.addEventListener("click", function(){
			self.showDB();
		})
		dbc.appendChild(scd);
		if(this.ui.showControl("delete-db")){
			var dbut = document.createElement("button");
			dbut.setAttribute("class", "reg-contol-button delete-db-button");
			dbut.appendChild(document.createTextNode("Delete Database"));
			dbut.addEventListener("click", function(){
				self.deleteDB();
			})
			dbc.appendChild(dbut);
		}
		if(this.ui.showControl("schema")){
			var scbut = document.createElement("button");
			scbut.setAttribute("class", "reg-contol-button schema-button");
			scbut.appendChild(document.createTextNode("View Schema"));
			scbut.addEventListener("click", function(){
				self.showSchema();
			})
			dbc.appendChild(scbut);
		}
		if(this.ui.showControl("query")){
			var qbut = document.createElement("button");
			qbut.setAttribute("class", "reg-contol-button query-button");
			qbut.appendChild(document.createTextNode("New Query"));
			qbut.addEventListener("click", function(){
				self.showQuery();
			})
			dbc.appendChild(qbut);
		}
		if(this.ui.showControl("document")){
			dbc.appendChild(this.getDocumentChooserDOM());
		}
		if(this.ui.showControl("create-document")){
			dbc.appendChild(this.getDocumentCreatorDOM());
		}
	}
	return dbc;
}

TerminusDBController.prototype.getDocumentChooserDOM = function(){
	var self = this;
	var scd = document.createElement("span");
	scd.setAttribute("class", "document-chooser");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-chooser-label");
	lab.appendChild(document.createTextNode("ID"));
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "document-chooser");
	dcip.setAttribute("placeholder", "Enter Document ID");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "reg-contol-button document-button")
	nbut.appendChild(document.createTextNode("View Document"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.showDocument(dcip.value);
	})
	scd.appendChild(lab);
	scd.appendChild(dcip);
	scd.appendChild(nbut);
	var showDoc = function(durl){
		self.showDocument(durl);
	}
	if(typeof getS2EntityChooser == "function"){
		var callback = showDoc;
		var mcls = FrameHelper.unshorten("dcog:Document");
		var searchurl = this.ui.server() + "/rest/" + this.ui.db() + "/query/search";
		var dburl = this.ui.server() + "/" + this.ui.db();
		var sdom = getS2EntityChooser(false, dburl, this.ui.client, mcls, searchurl, callback);
		jQuery(dcip).hide();
		jQuery(nbut).hide();
		var nlab = document.createElement("a");
		nlab.setAttribute("href", "#");
		nlab.setAttribute("class", "document-which-chooser");
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
	return scd;
};

TerminusDBController.prototype.getDocumentCreatorDOM = function(){
	var self = this;
	var scd = document.createElement("span");
	scd.setAttribute("class", "document-creator");
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "document-creator");
	dcip.setAttribute("placeholder", "Enter Document Type");
	var nbut = document.createElement("button");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-creator-label");
	lab.appendChild(document.createTextNode("Type"));
	nbut.setAttribute('class', "reg-contol-button create-document-button")
	nbut.appendChild(document.createTextNode("Create New Document"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.showCreateDocument(dcip.value);
	})
	scd.appendChild(lab);
	scd.appendChild(dcip);
	scd.appendChild(nbut);
	var mcls = FrameHelper.unshorten("dcog:Document");
	var wq = new WOQLQuery(this.ui.client, this.options);
	var filter = wq.getSubclassQueryPattern("Class", "dcog/'Document'") + ", not(" + wq.getAbstractQueryPattern("Class") + ")";
	var woql = wq.getClassMetaDataQuery(filter);
	wq.execute(woql)
	//this.ui.client.getSubClasses(this.ui.server + "/" + this.ui.db, mcls)
	.then(function(response){
		var clist = HTMLFrameHelper.getClassSelect(response);
		if(clist){
			clist.addEventListener("change", function(){
				if(this.value){
					self.showCreateDocument(this.value);
					this.value = "";
				}
			});
			FrameHelper.removeChildren(scd);
			var ccDOM = document.createElement("span");
			ccDOM.setAttribute("class", "create-document-list");
			ccDOM.appendChild(clist);
			scd.appendChild(ccDOM);
		}
		var nlab = document.createElement("a");
		nlab.setAttribute("href", "#");
		nlab.setAttribute("class", "document-which-chooser");
		nlab.appendChild(document.createTextNode("Text Input"));
		scd.prepend(nlab);
		var which = "select";
		nlab.addEventListener("click", function(){
			FrameHelper.removeChildren(scd);
			scd.appendChild(nlab);
			if(which == "select"){
				FrameHelper.removeChildren(nlab);
				nlab.appendChild(document.createTextNode("Dropdown List"));
				scd.appendChild(lab);
				scd.appendChild(dcip);
				scd.appendChild(nbut);
				which = "text";
			}
			else {
				scd.appendChild(ccDOM);
				FrameHelper.removeChildren(nlab);
				nlab.appendChild(document.createTextNode("Text Input"));
				which = "select";
			}
		})
	})
	.catch(function(error){
		console.error(error);
	});
	return scd;
};

//viewer can contain multiple 'pages' of content
 function TerminusContentViewer(ui, opts){
	this.ui = ui;
	this.pages = {};
	this.currentPage = false;
}

TerminusContentViewer.prototype.addNewPage = function(page){
	var pid = FrameHelper.genBNID();
	page.pageid = pid;
	this.pages[pid] = page;
	this.currentPage = pid;
}

TerminusContentViewer.prototype.makeActivePage = function(page){
	this.currentPage = page;
	this.redraw();
}

TerminusContentViewer.prototype.showServerMainPage = function(){
	var smp = new TerminusServerViewer(this);
	this.addNewPage(smp);
}

TerminusContentViewer.prototype.showLoadURLPage = function(val){
	var ul = new TerminusURLLoader(this, val);
	this.addNewPage(ul);
}

TerminusContentViewer.prototype.showDBMainPage = function(){
	var dbv = new TerminusDBViewer(this);
	this.addNewPage(dbv);
}

TerminusContentViewer.prototype.showCreateDBPage = function(){
	var dbv = new TerminusDBCreator(this);
	this.addNewPage(dbv);
}

TerminusContentViewer.prototype.showSchemaPage = function(durl){
	var dbv = new TerminusSchemaViewer(this);
	this.addNewPage(dbv);
}

TerminusContentViewer.prototype.showQueryPage = function(query){
	var dbv = new TerminusQueryViewer(this, query, this.options);
	this.addNewPage(dbv);
}

TerminusContentViewer.prototype.showDocument = function(durl){
	var dv = new TerminusDocumentViewer(this, this.ui.getDocViewerOptions());
	this.addNewPage(dv);
	dv.loadDocument(durl);
}

TerminusContentViewer.prototype.showCreateDocument = function(durl){
	var dv = new TerminusDocumentViewer(this, this.ui.getDocCreatorOptions());
	this.addNewPage(dv);
	dv.loadCreateDocument(durl);
}

//viewer can contain multiple 'pages' of content
TerminusContentViewer.prototype.busy = function(msg){
	if(msg === false){
		//clear busy
	}
	else {
		//freeze things...
	}
}

TerminusContentViewer.prototype.setDOM = function(target){
	this.target = target;
}

TerminusContentViewer.prototype.clearPages = function(){
	this.pages = {};
}

TerminusContentViewer.prototype.clear = function(){
	if(this.target) FrameHelper.removeChildren(this.target);
}

TerminusContentViewer.prototype.draw = function(){
	if(this.target){
		this.target.appendChild(this.getAsDOM());
	}
}

TerminusContentViewer.prototype.redraw = function(msg){
	if(this.target) {
		FrameHelper.removeChildren(this.target);
		this.target.appendChild(this.getAsDOM());
	}
	if(msg){
		this.ui.showMessage(msg);
	}
}

TerminusContentViewer.prototype.getAsDOM = function(page){
	var self = this;
	var cvdom = document.createElement("span");
	cvdom.setAttribute("class", "content-viewer");
	var hdom = document.createElement("span");
	hdom.setAttribute("class", "content-viewer-header");
	for(var pid in this.pages){
		var pagedom = document.createElement("span");
		var phdercls = "content-viewer-page content-viewer-page-" + pid;
		var sel = (this.currentPage !== false && this.currentPage == pid);
		if(sel)	phdercls += " content-viewer-current-page";
		else {
			var f = function(x){
				return function(){
					self.makeActivePage(x);
				}
			}
			pagedom.addEventListener("click", f(pid));
		}
		pagedom.setAttribute("class", phdercls);
		pagedom.appendChild(this.pages[pid].getLabelDOM(sel));
		hdom.appendChild(pagedom);
	}
	var bdom = document.createElement("span");
	bdom.setAttribute("class", "content-viewer-body");
	if(this.currentPage !== false){
		bdom.appendChild(this.pages[this.currentPage].getPageDOM());
	}
	cvdom.appendChild(hdom);
	cvdom.appendChild(bdom);
	return cvdom;
}

 function TerminusURLLoader(page, val){
	this.page = page;
	this.ui = page.ui;
	this.val = val;
}

TerminusURLLoader.prototype.getLabelDOM = function(selected){
	return document.createTextNode("Connect");
}

TerminusURLLoader.prototype.getPageDOM = function(selected){
	var scd = document.createElement("span");
	scd.setAttribute("class", "url-loader");
	var sci = document.createElement("span");
	sci.setAttribute("class", "url-field");
	var lab = document.createElement("span");
	lab.setAttribute("class", "url-loader-input");
	lab.appendChild(document.createTextNode("URL"))
	var ip = document.createElement("input");
	ip.setAttribute("type", "text");
	ip.setAttribute("class", "url-connect");
	ip.setAttribute("placeholder", "Enter Terminus Server URL");
	if(this.val){
		ip.value = this.val;
	}
	sci.appendChild(lab);
	sci.appendChild(ip);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "url-field");
	var klab = document.createElement("span");
	klab.setAttribute("class", "url-key-input");
	klab.appendChild(document.createTextNode("Key"))
	var key = document.createElement("input");
	key.setAttribute("type", "text");
	key.setAttribute("class", "url-key");
	key.setAttribute("placeholder", "Terminus Server API Key (optional)");
	sci.appendChild(klab);
	sci.appendChild(key);
	scd.appendChild(sci);
	var loadbut = document.createElement("button");
	loadbut.setAttribute("class", "url-load");
	loadbut.appendChild(document.createTextNode("Connect To Terminus Server"));
	var self = this;
	loadbut.addEventListener("click", function(){
		self.ui.load(ip.value, key.value);
	});
	scd.appendChild(loadbut);
	return scd;
}

 function TerminusServerViewer(page){
	this.page = page;
	this.ui = page.ui;
	this.server = this.ui.server();
}

TerminusServerViewer.prototype.getLabelDOM = function(selected){
	return document.createTextNode(this.server);
}

TerminusServerViewer.prototype.getPageDOM = function(selected){
	var self = this;
	var pd = document.createElement("span");
	pd.setAttribute("class", "server-home-page");
	if(this.server){
		var scd = document.createElement("span");
		scd.setAttribute("class", "server-home");
		if(this.ui.showView("server-details")){
			scd.appendChild(this.getServerDetailsDOM());
		}
		if(this.ui.showView("change-server")){
			var csbut = document.createElement("button");
			csbut.setAttribute("class", "reg-contol-button change-server-button")
			csbut.appendChild(document.createTextNode("Disconnect"));
			csbut.addEventListener("click", function(){
				self.ui.client.server = false;
				self.ui.viewer.showLoadURLPage();
				self.ui.redraw();
			})
			scd.appendChild(csbut);
		}
		if(this.ui.showView("create-db")){
			var crbut = document.createElement("button");
			crbut.setAttribute("class", "reg-contol-button create-db-button")
			crbut.appendChild(document.createTextNode("Create New Database"));
			crbut.addEventListener("click", function(){
				self.ui.viewer.showCreateDBPage();
				if(self.ui.db()){
					self.ui.client.dbid = false;
					self.ui.redraw();
				}
				else {
					self.ui.clearMessages();
					self.ui.viewer.redraw();
				}
			})
			scd.appendChild(crbut);
		}
		if(this.ui.showView("dblist")){
			scd.appendChild(this.getDBListDOM());
		}
		pd.appendChild(scd);
	}
	else {
		pd.appendChild(this.getLoadURLPage());
	}
	return pd;
}

TerminusServerViewer.prototype.getServerDetailsDOM = function(){
	var scd = document.createElement("span");
	scd.setAttribute("class", "server-details");
	var scl = document.createElement("span");
	scl.setAttribute("class", "server-details-label");
	scl.appendChild(document.createTextNode("Server"))
	var scs = document.createElement("span");
	scs.setAttribute("class", "server-details-value");
	scs.appendChild(document.createTextNode(this.server()))
	scd.appendChild(scl);
	scd.appendChild(scs);
	return scd;
}

TerminusServerViewer.prototype.getDBListDOM = function(){
	var sec = document.createElement("div");
	sec.setAttribute("class", "db-list-section");
	var lihed = document.createElement("span");
	lihed.setAttribute("class", "db-list-title");
	lihed.appendChild(document.createTextNode("Databases"));
	sec.appendChild(lihed);
	var scd = document.createElement("table");
	var self = this;
	var setDB = function(y){
		return function(){
			self.ui.client.dbid = y;
			self.page.showDBMainPage();
			self.ui.redraw();
		}
	}
	scd.setAttribute("class", "db-list");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var th1 = document.createElement("th");
	th1.appendChild(document.createTextNode("ID"));
	th1.setAttribute("class", "db-id");
	var th2 = document.createElement("th");
	th2.appendChild(document.createTextNode("Title"));
	th2.setAttribute("class", "db-title");
	var th3 = document.createElement("th");
	th3.appendChild(document.createTextNode("Description"));
	th3.setAttribute("class", "db-description");
	var th4 = document.createElement("th");
	th4.setAttribute("class", "db-size");
	th4.appendChild(document.createTextNode("Size"));
	var th5 = document.createElement("th");
	th5.setAttribute("class", "db-created");
	th5.appendChild(document.createTextNode("Created"));
	var th6 = document.createElement("th");
	th6.appendChild(document.createTextNode("Delete"));
	th6.setAttribute("class", "db-delete");
	thr.appendChild(th1);
	thr.appendChild(th2);
	thr.appendChild(th3);
	thr.appendChild(th4);
	thr.appendChild(th5);
	thr.appendChild(th6);
	thead.appendChild(thr);
	scd.appendChild(thead);
	var tbody = document.createElement("tbody");
	var dbrecs = this.ui.client.getServerDBRecords();
	for(var fullid in dbrecs){
		var dbrec = dbrecs[fullid];
		var dbid = fullid.split(":")[1];
		var tr = document.createElement("tr");
		var td1 = document.createElement("td");
		td1.appendChild(document.createTextNode(dbid));
		td1.setAttribute("class", "db-id");
		td1.addEventListener("click", setDB(dbid));
		var td2 = document.createElement("td");
		td2.setAttribute("class", "db-title");
		td2.addEventListener("click", setDB(dbid));
		var txt = (dbrec && dbrec['rdfs:label'] && dbrec['rdfs:label']['@value'] ? dbrec['rdfs:label']['@value'] : "");
		td2.appendChild(document.createTextNode(txt));
		var td3 = document.createElement("td");
		td3.addEventListener("click", setDB(dbid));
		td3.setAttribute("class", "db-description");
		var txt = (dbrec && dbrec['rdfs:comment'] && dbrec['rdfs:comment']['@value'] ? dbrec['rdfs:comment']['@value'] : "");
		td3.appendChild(document.createTextNode(txt));
		var td4 = document.createElement("td");
		td4.addEventListener("click", setDB(dbid));
		td4.setAttribute("class", "db-size");
		var txt = (dbrec && dbrec['terminus:size'] && dbrec['terminus:size']['@value'] ? dbrec['terminus:size']['@value'] : "");
		td4.appendChild(document.createTextNode(txt));
		var td5 = document.createElement("td");
		td5.addEventListener("click", setDB(dbid));
		td5.setAttribute("class", "db-created");
		var txt = (dbrec && dbrec['terminus:last_updated'] && dbrec['terminus:last_updated']['@value'] ? dbrec['terminus:last_updated']['@value'] : "");
		td5.appendChild(document.createTextNode(txt));
		var td6 = document.createElement("td");
		td6.setAttribute("class", "db-delete");
		if(this.deleteDBPermitted(dbrec)){
			var delbut = document.createElement("button");
			delbut.appendChild(document.createTextNode("Delete"));
			delbut.setAttribute("class", "reg-contol-button delete-db-button");
			//function to fix y
			var delDB = function(y){ return function(){self.ui.deleteDatabase(y);}};
			delbut.addEventListener("click", delDB(dbid));
			td6.appendChild(delbut);
		}
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);
		tr.appendChild(td5);
		tr.appendChild(td6);
		tbody.appendChild(tr);
	}
	scd.appendChild(tbody);
	sec.appendChild(scd);
	return sec;
}

TerminusServerViewer.prototype.deleteDBPermitted = function(dbrec){
	return true;
}

 function TerminusDBViewer(page){
	this.page = page;
	this.ui = page.ui;
	this.server = this.ui.server();
	this.db = this.ui.db();
}

TerminusDBViewer.prototype.getLabelDOM = function(selected){
	return document.createTextNode("DB " + this.db);
}

TerminusDBViewer.prototype.getPageDOM = function(selected){
	var pd = document.createElement("span");
	pd.setAttribute("class", "db-home-page");
	pd.appendChild(document.createTextNode("DB Home Page - "));
	var scd = document.createElement("span");
	scd.setAttribute("class", "db-details");
	var scl = document.createElement("span");
	scl.setAttribute("class", "db-details-label");
	scl.appendChild(document.createTextNode("Connected to Database "))
	var scs = document.createElement("span");
	scs.setAttribute("class", "db-details-value");
	var dbrec = this.ui.client.getDBRecord();
	if(dbrec){
		var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.db);
		scs.appendChild(document.createTextNode(nm));
	}
	scd.appendChild(scl);
	scd.appendChild(scs);
	pd.appendChild(scd);
	return pd;
}

 function TerminusDBCreator(page){
	this.page = page;
	this.ui = page.ui;
	this.server = page.ui.server();
}

TerminusDBCreator.prototype.getLabelDOM = function(selected){
	return document.createTextNode("Create DB");
}

TerminusDBCreator.prototype.getPageDOM = function(selected){
	var scd = document.createElement("span");
	scd.setAttribute("class", "db-creator");
	var sct = document.createElement("span");
	sct.setAttribute("class", "db-creator-title");
	sct.appendChild(document.createTextNode("Create New Database"));
	scd.appendChild(sct);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "id-label");
	slab.appendChild(document.createTextNode("ID"));
	sci.appendChild(slab);
	var idip = document.createElement("input");
	idip.setAttribute("type", "text");
	idip.setAttribute("placeholder", "No spaces or special characters allowed in IDs");
	sci.appendChild(idip);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "title-label");
	slab.appendChild(document.createTextNode("Title"));
	var titip = document.createElement("input");
	titip.setAttribute("type", "text");
	titip.setAttribute("placeholder", "A brief title for the DB");

	sci.appendChild(slab);
	sci.appendChild(titip);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "title-label");
	slab.appendChild(document.createTextNode("Description"));
	sci.appendChild(slab);
	var descip = document.createElement("textarea");
	descip.setAttribute("class", "db-description");
	descip.setAttribute("placeholder", "A short text describing the database and its purpose");

	sci.appendChild(descip);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "schema-label");
	slab.appendChild(document.createTextNode("Import Schema"));
	sci.appendChild(slab);
	var schem = document.createElement("input");
	schem.setAttribute("placeholder", "Enter URL of Schema");
	schem.setAttribute("type", "text");
	sci.appendChild(schem);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "data-label");
	slab.appendChild(document.createTextNode("Import Data"));
	sci.appendChild(slab);
	var datip = document.createElement("input");
	datip.setAttribute("type", "text");
	datip.setAttribute("placeholder", "Enter URL of Data");
	sci.appendChild(datip);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var nslab = document.createElement("span");
	nslab.setAttribute("class", "import-key");
	nslab.appendChild(document.createTextNode("Import Key"));
	sci.appendChild(nslab);
	var kip = document.createElement("input");
	kip.setAttribute("type", "text");
	kip.setAttribute("placeholder", "Import Key");
	sci.appendChild(kip);
	scd.appendChild(sci);
	var cancbut = document.createElement("button");
	cancbut.setAttribute("class", "cancel-db-button");
	cancbut.appendChild(document.createTextNode("Cancel"));
	var loadbut = document.createElement("button");
	loadbut.setAttribute("class", "create-db-button");
	loadbut.appendChild(document.createTextNode("Create"));
	var self = this;
	var gatherips = function(){
		var input = {};
		input.id = idip.value;
		input.title = titip.value;
		input.description = descip.value;
		input.schema = schem.value;
		input.data = datip.value;
		input.key = kip.value;
		return input;
	}
	var self = this;
	loadbut.addEventListener("click", function(){
		var input = gatherips();
		self.ui.createDatabase(input);
	})
	cancbut.addEventListener("click", function(){
		self.page.showServerMainPage();
		self.page.redraw();
	})
	scd.appendChild(cancbut);
	scd.appendChild(loadbut);
	return scd;
}


 function TerminusQueryViewer(page, query, options){
	this.page = page;
	this.ui = page.ui;
	this.options;
	this.wquery = new WOQLQuery(this.ui.client, this.options);
	this.init(query);
}

TerminusQueryViewer.prototype.init = function(q){
	var wq = new WOQLQuery(this.ui.client, this.options);
	var woql = wq.getElementMetaDataQuery();
	var self = this;
	self.meta = {};
	wq.execute(woql).then(function(wresult){
		if(wresult.hasBindings()){
			for(var i = 0; i<wresult.bindings.length; i++){
				var el = wresult.bindings[i].Element;
				if(el && typeof self.meta[el] == "undefined"){
					self.meta[el] = wresult.bindings[i];
				}
			}
		}
	})
	.catch(function(e){
		console.error(e);
	});
}


TerminusQueryViewer.prototype.getLabelDOM = function(selected){
	return document.createTextNode("Query");
}

TerminusQueryViewer.prototype.query = function(val, qresults){
	var self = this;
	FrameHelper.removeChildren(qresults);
	this.wquery.execute(val)
	.then(function(result){
		qresults.appendChild(document.createTextNode("Results: "));
		var rv = new WOQLResultsViewer(result, this.options);
		var nd = rv.getDOM();
		if(nd){
			qresults.appendChild(nd);
		}
	})
	.catch(function(err){
		console.error(err);
		self.ui.showError(err);
	});
}

TerminusQueryViewer.prototype.getPageDOM = function(q){
	var qres = document.createElement("span");
	qres.setAttribute("class", "query-results");
	var qbox = document.createElement("span");
	qbox.setAttribute("class", "query-page");
	var qip = document.createElement("textarea");
	qip.setAttribute("class", "query-box");
	if(q) qip.value = q;
	qbox.appendChild(qip);
	var self = this;
	var qbut = document.createElement("button");
	qbut.appendChild(document.createTextNode("Send Query"));
	qbut.addEventListener("click", function(){
		self.query(qip.value, qres);
	})

	var nqbut = document.createElement("button");
	nqbut.appendChild(document.createTextNode("Show All Classes"));
	nqbut.addEventListener("click", function(){
		qip.value = self.wquery.getClassMetaDataQuery();
		self.query(qip.value, qres);
	})

	var aqbut = document.createElement("button");
	aqbut.appendChild(document.createTextNode("Show Document Classes"));
	aqbut.addEventListener("click", function(){
		qip.value = self.wquery.getClassMetaDataQuery(self.wquery.getSubclassQueryPattern("Class", "dcog/'Document'") + ", not(" + self.wquery.getAbstractQueryPattern("Class") + ")");
		self.query(qip.value, qres);
	})

	var ebut = document.createElement("button");
	ebut.appendChild(document.createTextNode("Show All Schema Elements"));
	ebut.addEventListener("click", function(){
		qip.value = self.wquery.getElementMetaDataQuery();
		self.query(qip.value, qres);
	})
	var dbut = document.createElement("button");
	dbut.appendChild(document.createTextNode("Show All Documents"));
	dbut.addEventListener("click", function(){
		qip.value = self.wquery.getDocumentQuery();
		self.query(qip.value, qres);
	})
	var pbut = document.createElement("button");
	pbut.appendChild(document.createTextNode("Show All Data"));
	pbut.addEventListener("click", function(){
		qip.value = self.wquery.getEverythingQuery();
		self.query(qip.value, qres);
	})

	qbox.appendChild(qbut);
	qbox.appendChild(nqbut);
	qbox.appendChild(ebut);
	qbox.appendChild(dbut);
	qbox.appendChild(pbut);
	qbox.appendChild(aqbut);
	qbox.appendChild(qres);
	return qbox;
}

 function TerminusSchemaViewer(page){
	this.page = page;
	this.ui = page.ui;
	this.server = this.ui.server();
	this.db = this.ui.db();
	this.mode = "view";
}

TerminusSchemaViewer.prototype.getLabelDOM = function(selected){
	return document.createTextNode("Schema");
}

TerminusSchemaViewer.prototype.getPageDOM = function(selected){
	this.pagedom = document.createElement("span");
	var urlb = this.getURLLoadButton();
	if(urlb) this.pagedom.appendChild(urlb);
	var self = this;
	this.ui.client.getSchema()
	.then(function(response){
		self.schema = response;
		self.pagedom.appendChild(self.getSchemaViewDOM());
	});
	return this.pagedom;
}

TerminusSchemaViewer.prototype.getURLLoadButton = function(){
	var loadURLForm = this.getLoadFromURLDOM();
	var self = this;
	if(this.mode == "view"){
		var urlbut = document.createElement("button");
		urlbut.setAttribute("class", "import-schema-button");
		urlbut.appendChild(document.createTextNode("Import From URL"));
		urlbut.addEventListener("click", function(){
			FrameHelper.removeChildren(self.pagedom);
			self.pagedom.appendChild(loadURLForm);
		});
		return urlbut;
	}
	return false;
}

TerminusSchemaViewer.prototype.refreshPage = function(){
	FrameHelper.removeChildren(this.pagedom);
	var urlb = this.getURLLoadButton();
	if(urlb) this.pagedom.appendChild(urlb);
	if(this.schema){
		this.pagedom.appendChild(this.getSchemaViewDOM());
	}
}

TerminusSchemaViewer.prototype.updateSchema  = function(text, opts){
	var self = this;
	this.ui.showBusy("Updating Schema");
	return this.ui.client.updateSchema(false, text, opts)
	.then(function(response){
		self.ui.showBusy("Retrieving updated schema");
		self.ui.client.getSchema()
		.then(function(response){
			self.ui.clearBusy();
			self.schema = response;
			self.mode = "view";
			self.refreshPage("Successfully updated schema");
		});
	})
	.catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusSchemaViewer.prototype.load  = function(url, key){
	var self = this;
	this.ui.showBusy("Loading schema from " + url);
	return this.ui.client.getSchema(url, {key: key})
	.then(function(response){
		self.ui.showBusy("Updating schema");
		self.updateSchema(false, response).then(function(response){
			self.ui.clearBusy();
		});
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusSchemaViewer.prototype.getSchemaViewDOM = function(){
	var self = this;
	var sv = document.createElement("span");
	var scd = document.createElement("span");
	scd.setAttribute("class", "schema-view-header");
	if(this.mode == "edit"){
		var ipval = document.createElement("textarea");
		ipval.setAttribute("class", "schema-edit");
		ipval.innerHTML = this.schema.contents;
	}
	else {
		var ipval = document.createElement("pre");
		ipval.setAttribute("class", "schema-edit");
		ipval.innerHTML = this.schema.contents;
	}
	if(this.mode == "edit"){
		var opt = document.createElement("button");
		opt.appendChild(document.createTextNode("Save"));
		opt.setAttribute("class", "schema-save");
		opt.addEventListener("click", function(){
			self.updateSchema(ipval.value);
		});
		var opt2 = document.createElement("button");
		opt2.appendChild(document.createTextNode("Cancel"));
		opt2.setAttribute("class", "schema-cancel");
		opt2.addEventListener("click", function(){
			self.mode = "view";
			self.refreshPage();
		});
		scd.appendChild(opt);
		scd.appendChild(opt2);
	}
	else {
		var opt = document.createElement("button");
		opt.setAttribute("class", "schema-edit-button");
		opt.appendChild(document.createTextNode("Edit"));
		opt.addEventListener("click", function(){
			self.mode = "edit";
			self.refreshPage();
		});
		scd.appendChild(opt);
	}
	sv.appendChild(scd);
	var scb = document.createElement("span");
	scb.setAttribute("class", "schema-view-body");
	scb.appendChild(ipval);
	sv.appendChild(scb);
	return sv;
}

TerminusSchemaViewer.prototype.getLoadFromURLDOM = function(){
	var scd = document.createElement("span");
	scd.setAttribute("class", "url-loader");
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var lab = document.createElement("span");
	lab.setAttribute("class", "url-loader-input");
	lab.appendChild(document.createTextNode("URL"))
	var ip = document.createElement("input");
	ip.setAttribute("type", "text");
	ip.setAttribute("class", "url-connect");
	if(this.val){
		ip.value = this.val;
	}
	sci.appendChild(lab);
	sci.appendChild(ip);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "form-field");
	var klab = document.createElement("span");
	klab.setAttribute("class", "url-key-input");
	klab.appendChild(document.createTextNode("Key"))
	var key = document.createElement("input");
	key.setAttribute("type", "text");
	key.setAttribute("class", "url-key");
	sci.appendChild(klab);
	sci.appendChild(key);
	scd.appendChild(sci);
	var loadbut = document.createElement("button");
	loadbut.appendChild(document.createTextNode("Load Schema"));
	loadbut.setAttribute("class", "schema-load");
	var cancbut = document.createElement("button");
	cancbut.setAttribute("class", "cancel-schema-load");
	cancbut.appendChild(document.createTextNode("Cancel"));

	var self = this;
	loadbut.addEventListener("click", function(){
		self.load(ip.value, key.value);
	})
	cancbut.addEventListener("click", function(){
		self.refreshPage();
	})
	scd.appendChild(cancbut);
	scd.appendChild(loadbut);
	return scd;
}

function TerminusDocumentViewer(page, options){
	this.page = page;
	this.ui = page.ui;
	this.server = this.ui.server();
	this.db = this.ui.db();
	this.init();
	this.mode = (options && options.mode ? options.mode : "view");
	this.editor = (options && options.editor ? options.editor : false);
	this.load_schema = (options && options.load_schema ? options.load_schema : true);
	this.options = options;
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
		if(wresult && wresult.hasBindings()){
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
		if(url.indexOf("/") == -1) url = this.server + "/" + this.db + "/ontology/main#" + url;
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
	this.ui.showBusy("Loading Document from " + url);
	return this.ui.client.getDocument(url, {format: "frame"})
	.then(function(response){
		self.ui.clearBusy();
		self.loadDataFrames(response);
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
		//self.documentDeleted(URL);
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusDocumentViewer.prototype.createDocument = function(id){
	var self = this;
	var extr = this.renderer.extract();
	this.ui.showBusy("Creating document");
	return this.ui.client.createDocument(id, extr, opts)
	.then(function(response){
		self.ui.clearBusy();
		if(id) self.page.showDocument(id);
		else if(response["@id"]) self.page.showDocument(response["@id"]);
		self.page.redraw();
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusDocumentViewer.prototype.updateDocument = function(){
	var durl = this.document.subjid;
	var extr = this.renderer.extract();
	var self = this;
	this.ui.showBusy("Updating document " + durl);
	return this.ui.client.updateDocument(durl, extr, opts)
	.then(function(response){
		self.ui.clearBusy();
		self.page.showDocument(durl);
		self.page.redraw();
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
		this.renderer = new ObjectRenderer(this.document, false, this.options);
		this.renderer.mode = this.mode;
		this.renderer.controller = this;
	}
	if(this.renderer){
		return this.renderer.render();
	}
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

TerminusDocumentViewer.prototype.getLabelDOM = function(){
	this.labdom = document.createElement("span");
	this.labdom.appendChild(document.createTextNode("Document"));
	this.setLabel();
	return this.labdom;
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

TerminusDocumentViewer.prototype.getPageDOM = function(){
	this.pagedom = document.createElement("span");
	var rends = this.render();
	if(rends){
		this.pagedom.appendChild(rends);
	}
	return this.pagedom;
}
