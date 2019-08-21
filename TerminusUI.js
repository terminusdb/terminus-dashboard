/**
 * Terminus UI object
 *
 * Traffic control of messages going between different Terminus UI pages and features
 *
 * @param opts - options array
 */
function TerminusUI(opts){
	this.client = new WOQLClient();
	this.schema_cache = {};
	this.controls = [];
	this.setOptions(opts);
}

/*
 * Client connects to specified server and specified part
 * opts is a json with the following fields:
 * server: mandatory URL of the server to connect to
 * key: optional client API key
 * dbid: id of the database to connect to
 * schema: if set, the UI will load the schema page after connecting
 * query: if set, the query will be sent to the server and the results will be loaded on the query page
 * document: if set, the document page corresponding to this document will be loaded after connecting
 *
 * (note: schema, query, document are mutually exclusive and must also have a dbid set)
 */
TerminusUI.prototype.connect = function(opts){
	var self = this;
	this.client.server = false;
	var key = ((opts && opts.key) ? opts.key : false);
	this.showBusy("Connecting to server at " + opts.server);
	return this.client.connect(opts.server, key)
	.then( function(response) {
		self.clearBusy();
		if(opts && opts.db && self.getDBRecord(opts.db)){
			self.connectToDB(opts.db);
			if(opts.document && self.showView("get_document")){
				self.showDocument(opts.document);
			}
			else if(opts.schema && self.showView("get_schema")){
				self.showSchemaPage(opts.schema);
			}
			else if(opts.query && self.showView("woql_select")){
				self.showQueryPage(opts.query);
			}
      else if(opts.explorer && self.showView("api_explorer")){
				self.showExplorer(opts.explorer);
			}
			else {
				self.showDBMainPage();
			}
		}
		else {
			self.showServerMainPage();
		}
		self.redraw();
	})
	.catch(function(err) {
		self.clearBusy();
		self.showError(err);
	});
}

/**
 * Sends a request to create a new database to the server and interprets the response
 *
 * dbdets is a json object with the following fields:
 * id: the id of the new database (alphanumeric, no spaces, url friendly) mandatory
 * title: the text name of the new database for tables, etc. mandatory
 * description: text description of the database (optional)
 * key: a API client key for server auth
 * schema: the url of another Terminus DB from which to import schema
 * instance: the url of another Terminus DB from which to import data
 *
 */
TerminusUI.prototype.createDatabase = function(dbdets){
	var self = this;
	if(!dbdets.id || !dbdets.title){
        return Promise.reject(new Error(self.getBadArguments("createDatabase", "ID and title are mandatory fields")));
	}
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
		return self.refreshDBList()
		.then(function(response){
			if(crec = self.client.getDBRecord(dbid)){
				self.client.dbid = dbid;
				self.viewer.showDBMainPage();
				self.showMessage("Successfully Created Database " + dbid);
			}
			else {
		        return Promise.reject(new Error(self.getCrashString("createDatabase", "Failed to retrieve record of created database " + dbid)));
			}
		})
	})
	.catch(function(error){
		self.clearBusy();
		self.showError(error);
	});
}

/**
 * Deletes the database with the passed id from the currently connected server
 */
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
		self.showServerMainPage();
		self.showMessage("Successfully Deleted Database " + dbn);
		self.refreshDBList();
		return response;
	})
	.catch(function(error){
		self.clearBusy();
		self.showError(error);
	});
}

//showDBMainPage

/*
 * Transforms a details (id, title, description) array into  json-ld document
 */
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

TerminusUI.prototype.getBadArguments = function(fname, str){
	return "Bad arguments to " + fname + ": " + str;
}

TerminusUI.prototype.getCrashString = function(fname, str){
	return "Results from " + fname + " indicate the possibility of a system failure " + str;
}

/*
 * Parses the passed URL and turns it into a call to the connect function - loads the appropriate endpoing
 */
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
	else if(url && url.indexOf("/woql") != -1){
		url = url.substring(0, url.indexOf("/query"));
		args.query = url.substring(url.indexOf("/query")+7);
	}
	args.server = url;
	if(key) args.key = key;
	return this.connect(args);
}

/**
 * Fetches the DB URL from the url by chopping off the extra bits
 */
TerminusUI.prototype.getConnectionEndpoint = function(url){
	if(url && url.lastIndexOf("/schema") != -1){
		return url.substring(0, url.lastIndexOf("/schema"));
	}
	if(url && url.lastIndexOf("/document") != -1){
		return url.substring(0, url.lastIndexOf("/document"));
	}
	if(url && url.lastIndexOf("/frame") != -1){
		return url.substring(0, url.lastIndexOf("/frame"));
	}
	if(url && url.lastIndexOf("/woql") != -1){
		return url.substring(0, url.lastIndexOf("/woql"));
	}
	return url;
}

TerminusUI.prototype.server = function(){
	return this.client.server;
}

TerminusUI.prototype.db = function(){
	return this.client.dbid;
}

TerminusUI.prototype.clearServer = function(){
	this.client.server = false;
}

TerminusUI.prototype.connectToDB = function(dbid){
	this.client.dbid = dbid;
}

TerminusUI.prototype.clearDB = function(){
	this.client.dbid = false;
}

TerminusUI.prototype.removeDB = function(db, url){
	this.client.removeDBFromConnection(db, url);
}

TerminusUI.prototype.getDBRecord = function(db, url){
	return this.client.getDBRecord(db, url);
}

TerminusUI.prototype.refreshDBList = function(){
	var self = this;
	return this.client.connect();
}

TerminusUI.prototype.showServerMainPage = function(){
	this.viewer = new TerminusServerViewer(this);
	this.redraw();
}

TerminusUI.prototype.showLoadURLPage = function(val){
	this.viewer = new TerminusURLLoader(this, val);
	this.redraw();
}

TerminusUI.prototype.showDBMainPage = function(){
	this.viewer = new TerminusDBViewer(this);
	this.redraw();
}

TerminusUI.prototype.showCreateDBPage = function(){
	this.viewer = new TerminusDBCreator(this);
	this.redraw();
}

TerminusUI.prototype.showSchemaPage = function(durl){
	this.viewer = new TerminusSchemaViewer(this);
	this.redrawMainPage();
}

TerminusUI.prototype.showQueryPage = function(query){
	this.viewer = new TerminusQueryViewer(this, query, this.options);
	this.redrawMainPage();
}

TerminusUI.prototype.showDocument = function(durl){
	this.viewer = new TerminusDocumentViewer(this, "view", this.getDocViewerOptions());
	this.viewer.loadDocument(durl);
	this.redrawMainPage();
}

TerminusUI.prototype.showCreateDocument = function(durl){
	this.viewer = new TerminusDocumentViewer(this, "create", this.getDocCreatorOptions());
	this.viewer.loadCreateDocument(durl);
	this.redrawMainPage();
}

TerminusUI.prototype.redrawMainPage = function(){
	FrameHelper.removeChildren(this.main);
	if(this.viewer){
		this.main.appendChild(this.viewer.getAsDOM());
	}
}

TerminusUI.prototype.showError = function(response){
	this.showMessage(response);
};

TerminusUI.prototype.clearMessages = function(response){
	if(this.messages) FrameHelper.removeChildren(this.messages);
};

TerminusUI.prototype.clearMainPage = function(){
	if(this.main) FrameHelper.removeChildren(this.main);
}

TerminusUI.prototype.setMessageDOM = function(dom){
	this.messages = dom;
}

TerminusUI.prototype.setControllerDOM = function(dom){
	this.controller = dom;
}

TerminusUI.prototype.setExplorerDOM = function(dom){
	this.explorer = dom;
}

TerminusUI.prototype.setPluginsDOM = function(dom){
	this.plugins = dom;
}

TerminusUI.prototype.setViewerDOM = function(dom){
	this.main = dom;
}

TerminusUI.prototype.draw = function(comps, slocation){
	if(comps && comps.messages) this.setMessageDOM(comps.messages);
	if(comps && comps.controller) this.setControllerDOM(comps.controller);
  if(comps && comps.explorer) this.setExplorerDOM(comps.explorer);
	if(comps && comps.viewer) this.setViewerDOM(comps.viewer);
	if(comps && comps.plugins) this.setPluginsDOM(comps.plugins);
	if(this.controller){
		this.drawControls();
	}
  if(this.explorer){
		this.drawExplorer();
	}
	if(this.plugins){
		this.drawPlugins();
	}
	if(slocation && slocation.server){
		if(typeof this.client.connection[slocation.server] == "undefined") this.connect(slocation)
		.catch(function(error){
			this.showLoadURLPage();
			this.showError(error);
		});
	}
	else {
		this.showLoadURLPage();
	};
}

TerminusUI.prototype.redraw = function(msg){
	this.clearMessages();
	if(this.controller){
		FrameHelper.removeChildren(this.controller);
		this.drawControls();
	}
  if(this.explorer){
		FrameHelper.removeChildren(this.explorer);
		this.drawExplorer();
	}
	if(this.viewer){
		this.redrawMainPage();
	}
	if(msg) this.showMessage(msg);
};

TerminusUI.prototype.redrawAfterSuccess = function(msg){
	//this.redraw(msg);
}

TerminusUI.prototype.drawControls = function(){
	this.controls = [];
	this.loadControls();
	for(var i = 0; i<this.controls.length; i++){
		var ncontrol = this.controls[i];
		if(ncontrol){
			var nd = ncontrol.getAsDOM();
			if(nd) {
				this.controller.appendChild(nd);
			}
		}
	}
}

TerminusUI.prototype.drawExplorer = function(){
  if(this.explorer){
    if(this.showControl("api_explorer")){
       var exp = new ApiExplorer(this);
       ae = exp.getAsDOM();
       this.explorer.appendChild(ae);
    }
  }
}

TerminusUI.prototype.loadControls = function(){
	if(this.showControl('server')){
		var sc = new TerminusServerController(this);
		if(sc) {
			this.controls.push(sc);
		}
		if(this.db() && this.showControl("db")){
			var sc = new TerminusDBController(this);
			if(sc) this.controls.push(sc);
		}
	}
}

TerminusUI.prototype.showControl = function(el){
	if(this.show_controls.indexOf(el) == -1) return false;
	if(this.pseudoCapability(el)) return true;
	if(this.client.capabilitiesPermit(el)) {
		return true;
	}
	return false;
}

TerminusUI.prototype.showView = function(el){
	if(this.show_views.indexOf(el) == -1) return false;
	if(this.pseudoCapability(el)) return true;
	if(this.client.capabilitiesPermit(el)) {
		return true;
	}
	return false;
}

TerminusUI.prototype.pseudoCapability = function(el){
	var pseuds = ["server", "db", "change-server", "api_explorer", "import_schema", "schema_format"];
	if(pseuds.indexOf(el) == -1) return false;
	return true;
}


TerminusUI.prototype.showResult = function(response){
	alert("result");
};

TerminusUI.prototype.clearBusy = function(response){
	this.clearMessages();
	if(this.viewer && typeof this.viewer.busy == "function") this.viewer.busy(false);
}

TerminusUI.prototype.showMessage = function(msg){
	if(this.messages){
		this.messages.appendChild(document.createTextNode(msg));
	}
};

TerminusUI.prototype.showBusy = function(msg){
	this.showMessage(msg);
	if(this.viewer && typeof this.viewer.busy == "function") this.viewer.busy(msg);
};


TerminusUI.prototype.setOptions = function(opts){
	this.show_controls = opts && opts.controls ? opts.controls : ["server", "db", "change-server", "schema_format", "import_schema", "class_frame", "create_database", "create_document", "get_document", "update_schema", "get_schema", "woql_select"];
	this.show_views = opts && opts.views ? opts.views : this.show_controls;
	if(opts.document){
		this.document_options = opts.document;
	}
	if(opts.schema){
		this.schema_options = opts.schema;
	}
	if(opts.css){
		this.loadCSS(opts.css);
	}
	this.enabled_plugins = (opts.plugins ? opts.plugins :  this.DefaultPlugins());
	this.loadControls();
}

TerminusUI.prototype.drawPlugins = function(){
	var allplugs = this.getSupportedPlugins();
	this.plugins.appendChild(document.createTextNode("Plugins: "));
	for(var plug in allplugs){
		var oneplug = allplugs[plug];
		var disabled = false;
		if(oneplug.requires){
			for(var i = 0; i<oneplug.requires.length; i++){
				if(this.enabled_plugins.indexOf(oneplug.requires[i]) == -1){
					disabled = "disabled";
					continue;
				}
			}
		}
		if(this.enabled_plugins.indexOf(plug) !== -1 && !disabled){
			this.plugins.appendChild(this.getPluginDOM(plug, oneplug, "checked"));
		}
		else {
			this.plugins.appendChild(this.getPluginDOM(plug, oneplug, disabled));
		}
	}
}

TerminusUI.prototype.getPluginDOM = function(plugid, obj, checked){
	var cl = document.createElement("span");
	cl.setAttribute("class", "terminus-plugin-control");
	var cbox = document.createElement("input");
	cbox.id = "terminus-plugin-control-" + plugid;
	cbox.type = "checkbox";
	if(checked && checked == "checked") cbox.checked = true;
	if(checked && checked == "disabled") cbox.disabled = true;
	var clab = document.createElement("label");
	clab.setAttribute("class", "terminus-plugin-label terminus-plugin-label-full-css");
	clab.setAttribute("for", cbox.id);
	clab.appendChild(document.createTextNode(obj.label));
	cl.appendChild(clab);
	cl.appendChild(cbox);
	var self = this;
	cbox.addEventListener("change", function(){
		self.togglePlugin(plugid);
	})
	return cl;
}

TerminusUI.prototype.togglePlugin = function(plugid){
	if(this.enabled_plugins.indexOf(plugid) == -1){
		this.enabled_plugins.push(plugid);
	}
	else {
		nplugs = [];
		for(var i = 0; i<this.enabled_plugins.length; i++){
			if(this.enabled_plugins[i] != plugid){
				nplugs.push(this.enabled_plugins[i]);
			}
		}
		this.enabled_plugins = nplugs;
	}
	FrameHelper.removeChildren(this.plugins);
	this.redraw();
	this.drawPlugins();
}


//TerminusUI.prototype.loadPlugins = function(opts){}

TerminusUI.prototype.getSupportedPlugins = function(){
	var splugs = {
		"font-awesome" : { label : "Font Awesome", version: "3.0.1" },
		/*"bootstrap" : { label : "Bootstrap Styles", version: "3.0.1" },*/
		"jquery" : { label : "Jquery", version: "5.0.1" },
		"datatables" : { label : "Datatables", version: "5.0.1", requires: ['jquery'] },
		"select2" : { label : "Select 2", version: "5.0.1", requires: ['jquery'] },
		"gmaps" : { label : "Google Maps", version: "5.0.1"},
		"openlayers" : { label : "Open Layers", version: "5.0.1"},
		"d3" : { label : "D3 Graphics", version: "5.0.1"}
	};
	return splugs;
};

TerminusUI.prototype.getDefaultPlugins = function(){
	var defplugs = [];
	return defplugs;
}


TerminusUI.prototype.loadCSS = function(css){
	cssfid = "terminus_client_css";
	var cssdom = document.getElementById(cssfid);
	if(cssdom){
		cssdom.parentNode.removeChild(cssdom);
	}
	if(css){
		cssurl = "css/" + css + ".css";
		FrameHelper.loadDynamicCSS(cssfid, cssurl);
	}
}

TerminusUI.prototype.getDocViewerOptions = function(){
	if(this.document_options && this.document_options['view']){
		return this.document_options['view'];
	}
	return false;
}

TerminusUI.prototype.getDocCreatorOptions = function(){
	if(this.document_options && this.document_options['view']){
		return this.document_options['view'];
	}
	return false;
}

TerminusUI.prototype.getClassFrameOptions = function(){
	return this.viewdoc_options;
}
