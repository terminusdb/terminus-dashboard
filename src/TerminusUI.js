/**
 * Terminus UI object
 *
 * Traffic control of messages going between different Terminus UI pages and features
 *
 * @param opts - options array
 */
const ApiExplorer = require('./ApiExplorer');
const TerminusDBsdk = require('./TerminusDB');
const TerminusViolations = require('./html/TerminusViolation');
const TerminusQueryViewer = require('./TerminusQuery');
const TerminusSchemaViewer = require('./TerminusSchema');
const TerminusServersdk = require('./TerminusServer');
const TerminusURLLoader = require('./TerminusURL');
const TerminusPluginManager = require('./plugins/TerminusPlugin');
const UTILS = require('./Utils');
const HTMLHelper = require('./html/HTMLHelper');
const TerminusClient = require('@terminusdb/terminus-client');

function TerminusUI(opts){
	this.client = new TerminusClient.WOQLClient();
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
	this.client.connectionConfig.server = false;
	var key = ((opts && opts.key) ? opts.key : false);
	this.showBusy("Connecting to server at " + opts.server);
	return this.client.connect(opts.server, key)
	.then( function(response) {
		self.clearBusy();
		if(opts && opts.db && self.getDBRecord(opts.db)){
			self.connectToDB(opts.db);
			if(opts.document && self.showView("get_document")){
				response = self.showDocumentPage(opts.document);
			}
			else if(opts.schema && self.showView("get_schema")){
				response = self.showSchemaPage(opts.schema);
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
		return response;
	})
	.catch(function(err) {
		self.clearBusy();
		self.showError(err);
		throw(err);
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
	.then(function(response){ //reload list of databases in background..
		self.clearBusy();
		return self.refreshDBList()
		.then(function(response){
			if(crec = self.client.connection.getDBRecord(dbid)){
				self.client.connectionConfig.dbid = dbid;
				self.showDBMainPage();
				self.showMessage("Successfully Created Database " + dbid, "success");
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
	var delrec = this.client.connection.getDBRecord();
	var lid = (dbid ? dbid : this.db());
	var dbn = (delrec && delrec['rdfs:label'] && delrec['rdfs:label']["@value"] ? delrec['rdfs:label']["@value"] + " (id: " + lid + ")" : lid);
	this.showBusy("Deleting database " + dbn);
	return this.client.deleteDatabase(lid)
	.then(function(response){
		self.clearBusy();
		self.showServerMainPage();
		self.showMessage("Successfully Deleted Database " + dbn, "warning");
		self.refreshDBList();
		return response;
	})
	.catch(function(error){
		self.clearBusy();
		self.showError(error);
	});
}

/*
 * Transforms a details (id, title, description) array into  json-ld document
 */
TerminusUI.prototype.generateNewDatabaseDocument = function(dets){
	var doc = {
		"@context" : {
			rdfs: "http://www.w3.org/2000/01/rdf-schema#",
			terminus: "http://terminusdb.com/schema/terminus#"
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
	return this.client.connectionConfig.server;
}

TerminusUI.prototype.db = function(){
	return this.client.connectionConfig.dbid;
}

TerminusUI.prototype.clearServer = function(){
	this.client.connectionConfig.server = false;
}

TerminusUI.prototype.connectToDB = function(dbid){
	this.client.connectionConfig.dbid = dbid;
	//set standard prefixes for the current db
	TerminusClient.UTILS.addURLPrefix('doc', this.client.connectionConfig.dbURL() + "/document/");
	TerminusClient.UTILS.addURLPrefix('scm', this.client.connectionConfig.dbURL() + "/schema#");
}

TerminusUI.prototype.clearDB = function(){
	this.client.connectionConfig.dbid = false;
}

TerminusUI.prototype.removeDB = function(db, url){
	this.client.connection.removeDB(db, url);
}

TerminusUI.prototype.getDBRecord = function(db, url){
	return this.client.connection.getDBRecord(db, url);
}

TerminusUI.prototype.refreshDBList = function(){
	var self = this;
	return this.client.connect();
}

TerminusUI.prototype.showServerMainPage = function(){
	this.viewer = new TerminusServersdk.TerminusServerViewer(this);
	this.redrawMainPage();
}

TerminusUI.prototype.showCollaboratePage = function(){
	this.viewer = new TerminusURLLoader(this);
	this.redrawMainPage();
}


TerminusUI.prototype.showLoadURLPage = function(val){
	this.viewer = new TerminusURLLoader(this, val);
	this.redrawMainPage();
}

TerminusUI.prototype.showDBMainPage = function(){
	this.viewer = new TerminusDBsdk.TerminusDBViewer(this);
	this.page = "db";
	this.redraw();
}

TerminusUI.prototype.showCreateDBPage = function(){
	this.viewer = new TerminusDBsdk.TerminusDBCreator(this);
	this.redrawMainPage();
}

TerminusUI.prototype.showSchemaPage = function(durl){
	this.viewer = new TerminusSchemaViewer(this);
	this.redrawMainPage();
}

TerminusUI.prototype.showQueryPage = function(query){
	this.viewer = new TerminusQueryViewer(this, query, this.options);
	this.redrawMainPage();
}

TerminusUI.prototype.showDocumentPage = function(durl){
	this.viewer = new TerminusDBsdk.TerminusDBViewer(this);
	this.page = "docs";
	if(durl){
		this.viewer.docid = durl;
	}
	this.redrawMainPage();
}

TerminusUI.prototype.showCreateDocument = function(durl){
	this.viewer = new TerminusDocumentViewer(this, "create", this.getDocCreatorOptions());
	const promise = this.viewer.loadCreateDocument(durl);
	this.redrawMainPage();
	return promise;
}

TerminusUI.prototype.redrawMainPage = function(){
	HTMLHelper.removeChildren(this.mainDOM);
	if(this.viewer && this.mainDOM){
		var x = this.viewer.getAsDOM();
		this.mainDOM.appendChild(x);
	}
}

TerminusUI.prototype.deleteDBPermitted = function(dbid){
	if(dbid == "terminus") return false;
	if(this.client.connection.capabilitiesPermit("delete_database", dbid)){
		return true;
	}
	return false;
}

TerminusUI.prototype.getDeleteDBButton = function(dbid){
	if(!this.deleteDBPermitted(dbid)) return false;
	//var delbut = document.createElement('button');
	var icon = document.createElement('i');
	icon.setAttribute("class", "terminus-db-list-del-icon fa fa-trash");
	//delbut.appendChild(icon);
	//delbut.appendChild(document.createTextNode("Delete Database"));
	//delbut.setAttribute("class", "terminus-control-button terminus-delete-db-button");
		// function to fix db in a closure
	var self = this;
	var delDB = function(db){
		return function(){
			let deleteConfirm = confirm(`This action is irreversible, it will remove the database from the system permanently. Are you sure you want to delete ${db} Database?`);
			if (deleteConfirm == true) {
				self.deleteDatabase(db);
			}
		}
	};
	icon.addEventListener("click", delDB(dbid));
	return icon;
}

TerminusUI.prototype.showResult = function(response){
	this.showMessage(response, "success");
};

TerminusUI.prototype.showError = function(response){
	this.showMessage(response, "error");
};

TerminusUI.prototype.showWarning = function(response){
	this.showMessage(response, "warning");
};


TerminusUI.prototype.clearMessages = function(response){
	if(this.messages) HTMLHelper.removeChildren(this.messages);
};

TerminusUI.prototype.clearMainPage = function(){
	if(this.main) HTMLHelper.removeChildren(this.main);
}

TerminusUI.prototype.setMessageDOM = function(dom){
	this.messages = dom;
}

TerminusUI.prototype.setbuttonControls = function(dom){
	this.buttons = dom;
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
	this.mainDOM = dom;
}

TerminusUI.prototype.draw = function(comps, slocation){
	if(comps && comps.viewer) this.setViewerDOM(comps.viewer);
	if(comps && comps.buttons) this.setbuttonControls(comps.buttons);
	if(comps && comps.messages) this.setMessageDOM(comps.messages);
	if(comps && comps.controller) this.setControllerDOM(comps.controller);
	//if(comps && comps.explorer) this.setExplorerDOM(comps.explorer);
	if(comps && comps.plugins) this.setPluginsDOM(comps.plugins);
	if(this.plugins){
		this.drawPlugins();
	}
	if(this.buttons){
		//this.toggleControl();
	}
	var self = this;
	var cdrawn = false;
	if(slocation && slocation.server){
		if(typeof this.client.connection.connection[slocation.server] == "undefined") {
			return this.connect(slocation)
			.catch(function(error){
				self.showLoadURLPage();
			});
		}
	}
	else {
		this.showLoadURLPage();
	};
}

TerminusUI.prototype.redraw = function(msg){
	this.clearMessages();
	this.redrawControls();
	if(this.explorer){
		HTMLHelper.removeChildren(this.explorer);
		//this.drawExplorer();
	}
	if(this.viewer){
		this.redrawMainPage();
	}
	if(msg) this.showMessage(msg);
};


TerminusUI.prototype.toggleDashboardWidget = function(widget){
    HTMLHelper.removeChildren(this.controller);
    HTMLHelper.removeChildren(this.explorer);
    UTILS.removeSelectedNavClass('terminus-dashboard-selected');
    widget.classList.add('terminus-dashboard-selected');
}

TerminusUI.prototype.toggleControl = function(){
 /* var self = this;
  this.buttons.client.addEventListener('click', function(){
    self.toggleDashboardWidget(this);
    self.drawControls();
    self.showServerMainPage();
  })
  this.buttons.explorer.addEventListener('click', function(){
    self.toggleDashboardWidget(this);
    self.drawExplorer();
  })*/
}

TerminusUI.prototype.redrawControls = function(){
	if(this.controller){
		HTMLHelper.removeChildren(this.controller);
		this.drawControls();
	}
}

TerminusUI.prototype.drawControls = function(){
	this.controls = [];
	this.loadControls();
	for(var i = 0; i<this.controls.length; i++){
		var ncontrol = this.controls[i];
		if(ncontrol && (nd = ncontrol.getAsDOM())){
			this.controller.appendChild(nd);
		}
	}
}

TerminusUI.prototype.drawExplorer = function(){
	if(this.explorer){
		if(this.showControl("api_explorer")){
			var exp = new ApiExplorer(this);
			ae = exp.getAsDOM();
			this.explorer.appendChild(ae);
			this.explorer.style.display = 'block';
		}
	}
}

TerminusUI.prototype.loadControls = function(){
	if(this.showControl('server')){
		var sc = new TerminusServersdk.TerminusServerController(this);
		if(sc) {
			this.controls.push(sc);
		}
		if(this.db() && this.showControl("db")){
			var sc = new TerminusDBsdk.TerminusDBController(this);
			if(sc) this.controls.push(sc);
		}
	}
}

TerminusUI.prototype.showControl = function(el){
	if(this.show_controls.indexOf(el) == -1) return false;
	if(this.pseudoCapability(el)) return true;
	if(this.client.connection.capabilitiesPermit(el)) {
		return true;
	}
	return false;
}

TerminusUI.prototype.showView = function(el){
	if(this.show_views.indexOf(el) == -1) return false;
	if(this.pseudoCapability(el)) return true;
	if(this.client.connection.capabilitiesPermit(el)) {
		return true;
	}
	return false;
}

TerminusUI.prototype.clearBusy = function(response){
	this.clearMessages();
	if(this.viewer && typeof this.viewer.busy == "function") this.viewer.busy(false);
}

TerminusUI.prototype.getBusyLoader = function(bsyDom){
     var pd = document.createElement('div');
     var pbc = document.createElement('div');
     pbc.setAttribute('class', 'term-progress-bar-container');
     pd.appendChild(pbc);

     var pbsa = document.createElement('div');
     pbsa.setAttribute('class', 'term-progress-bar term-stripes animated reverse slower');
     pbc.appendChild(pbsa);
     var pbia = document.createElement('span');
     pbia.setAttribute('class', 'term-progress-bar-inner');
     pbsa.appendChild(pbia);

     bsyDom.appendChild(pd);
}

TerminusUI.prototype.showMessage = function(msg, type){
	if(this.messages){
		HTMLHelper.removeChildren(this.messages);
		var md = document.createElement('div');
        switch(type){
            case 'busy':
                var msgHolder = document.createElement('div');
                msgHolder.setAttribute('class', 'terminus-busy-msg')
                msgHolder.appendChild(document.createTextNode(msg));
                md.appendChild(msgHolder);
                this.getBusyLoader(md);
            break;
            case 'success':
                md.setAttribute('class', 'terminus-show-msg-success');
                md.appendChild(document.createTextNode(msg));
            break;
            case 'error':
                md.setAttribute('class', 'terminus-show-msg-error');
                md.appendChild(document.createTextNode(msg));
            break;
            case 'info':
                md.setAttribute('class', 'terminus-show-msg-info');
                md.appendChild(document.createTextNode(msg));
            break;
            case 'warning':
                md.setAttribute('class', 'terminus-show-msg-warning');
                md.appendChild(document.createTextNode(msg));
            break;
        }
		this.messages.appendChild(md);
	}
};

TerminusUI.prototype.showViolations = function(vios, type){
	var nvios = new TerminusViolations(vios, this);
	if(this.messages){
		var cmsg = (type == "schema" ? " in Schema" : " in Document");
		HTMLHelper.removeChildren(this.messages);
		this.messages.appendChild(nvios.getAsDOM(cmsg));
	}
}

TerminusUI.prototype.showBusy = function(msg){
	this.showMessage(msg, "busy");
	if(this.viewer && typeof this.viewer.busy == "function") this.viewer.busy(msg);
};

TerminusUI.prototype.pseudoCapability = function(el){
	var pseuds = ["server", "db", "collaborate", "change-server", "api_explorer", "import_schema", "add_new_library"];
	if(pseuds.indexOf(el) == -1) return false;
	return true;
}

TerminusUI.prototype.setOptions = function(opts){
	this.show_controls = opts && opts.controls ? opts.controls :
		["server", "db", "change-server", "schema_format",
			"import_schema", "class_frame", "create_database",
			"collaborate", "get_document", "update_schema",
			"get_schema", "woql_select"
		];
	this.show_views = opts && opts.views ? opts.views : this.show_controls;
	if(opts.document){
		this.document_options = opts.document;
	}
	if(opts.schema){
		this.schema_options = opts.schema;
	}
	this.piman = new TerminusPluginManager();
	var self = this;
	this.piman.init(opts.plugins, function(){
		/*var pins = ["gmaps", "quill", "select2"];
		for(var i = 0; i<pins.length; i++){
			if(self.piman.pluginAvailable(pins[i])){
				//RenderingMap.addPlugin(pins[i]);
			}
		}*/
		//self.redraw();
	});
	if(opts.css && this.piman){
		this.piman.loadPageCSS(opts.css);
	}
	this.loadControls();
}

TerminusUI.prototype.pluginAvailable = function(p){
	return this.piman.pluginAvailable(p);
}

TerminusUI.prototype.drawPlugins = function(){
	if(!this.piman) {
		console.log(new Error("No plugin manager initialised in UI object"));
		return false;
	}
	this.plugins.appendChild(this.piman.getAsDOM(this));
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

module.exports=TerminusUI
