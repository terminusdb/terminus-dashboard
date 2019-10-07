/**
 * Terminus UI object
 *
 * Traffic control of messages going between different Terminus UI pages and features
 *
 * @param opts - options array
 */
const ApiExplorer = require('./ApiExplorer');
const TerminusDocumentViewer = require('./client/TerminusDocument');
const TerminusDBsdk = require('./client/TerminusDB');
const TerminusViolations = require('./client/TerminusViolation');
const TerminusQueryViewer = require('./client/TerminusQuery');
const TerminusMappingViewer = require('./client/TerminusMapping');
const TerminusSchemaViewer = require('./client/TerminusSchema');
const TerminusServersdk = require('./client/TerminusServer');
const TerminusURLLoader = require('./client/TerminusURL');
const TerminusPluginManager = require('./plugins/TerminusPlugin');
const UTILS=require('./Utils');
const RenderingMap = require('./client/RenderingMap');
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
				response = self.showDocument(opts.document);
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
	var myserver = this.client.connectionConfig.server;
	self.showBusy("Creating Database " + dbdets.title + " with id " + dbid);
	var dbdoc = this.generateNewDatabaseDocument(dbdets);
	return this.client.createDatabase(dbid, dbdoc)
	.then(function(response){ //import schema into newly created DB
		if(dbdets.schema){
			self.showBusy("Fetching imported schema from " + dbdets.schema);
			var opts = (dbdets.key ?  {"terminus:user_key": dbdets.key } : {});
			opts['terminus:encoding'] = "terminus:turtle";
			return self.client.getSchema(dbdets.schema, opts)
			.then(function(response){
				self.showBusy("Updating database with new schema");
				self.client.connectionConfig.server = myserver;
				self.client.connectionConfig.dbid = dbid;
				var nopts = {'terminus:encoding':  "terminus:turtle"};
				return self.client.updateSchema(false, response, nopts);
			})
			.then(function(response){
				self.clearBusy();
				self.redraw();
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
	return this.client.deleteDatabase(dbid)
	.then(function(response){
		self.clearBusy();
		self.client.connectionConfig.dbid = false;
		self.removeDB(dbid);
		self.showServerMainPage();
		self.showMessage("Successfully Deleted Database " + dbn, "success");
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
	TerminusClient.FrameHelper.standard_urls['doc'] = this.client.connectionConfig.dbURL() + "/document/";
	TerminusClient.FrameHelper.standard_urls['scm'] = this.client.connectionConfig.dbURL() + "/schema#";
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

TerminusUI.prototype.showLoadURLPage = function(val){
	this.viewer = new TerminusURLLoader(this, val);
	this.redrawMainPage();
}

TerminusUI.prototype.showDBMainPage = function(){
	this.viewer = new TerminusDBsdk.TerminusDBViewer(this);
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

TerminusUI.prototype.showMappingPage = function(mapping){
	this.viewer = new TerminusMappingViewer(this, mapping, this.options);
	this.redrawMainPage();
}

TerminusUI.prototype.showDocument = function(durl){
	this.viewer = new TerminusDocumentViewer(this, "view", this.getDocViewerOptions());
	const promise = this.viewer.loadDocument(durl);
	this.redrawMainPage();
	return promise;
}

TerminusUI.prototype.showCreateDocument = function(durl){
	this.viewer = new TerminusDocumentViewer(this, "create", this.getDocCreatorOptions());
	const promise = this.viewer.loadCreateDocument(durl);
	this.redrawMainPage();
	return promise;
}

TerminusUI.prototype.redrawMainPage = function(){
	TerminusClient.FrameHelper.removeChildren(this.main);
	if(this.viewer){
		this.main.appendChild(this.viewer.getAsDOM());
	}
}

TerminusUI.prototype.showResult = function(response){
	this.showMessage(response, "success");
};

TerminusUI.prototype.showError = function(response){
	this.showMessage(response, "error");
};

TerminusUI.prototype.clearMessages = function(response){
	if(this.messages) TerminusClient.FrameHelper.removeChildren(this.messages);
};

TerminusUI.prototype.clearMainPage = function(){
	if(this.main) TerminusClient.FrameHelper.removeChildren(this.main);
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
	this.main = dom;
}

TerminusUI.prototype.draw = function(comps, slocation){
	if(comps && comps.buttons) this.setbuttonControls(comps.buttons);
	if(comps && comps.messages) this.setMessageDOM(comps.messages);
	if(comps && comps.controller) this.setControllerDOM(comps.controller);
	if(comps && comps.explorer) this.setExplorerDOM(comps.explorer);
	if(comps && comps.viewer) this.setViewerDOM(comps.viewer);
	if(comps && comps.plugins) this.setPluginsDOM(comps.plugins);
	if(this.plugins){
		this.drawPlugins();
	}
	if(this.buttons){
		this.toggleControl();
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
	if(this.controller){
		TerminusClient.FrameHelper.removeChildren(this.controller);
		this.drawControls();
	}
	if(this.explorer){
		TerminusClient.FrameHelper.removeChildren(this.explorer);
		//this.drawExplorer();
	}
	if(this.viewer){
		this.redrawMainPage();
	}
	if(msg) this.showMessage(msg);
};


TerminusUI.prototype.toggleDashboardWidget = function(widget){
    TerminusClient.FrameHelper.removeChildren(this.controller);
    TerminusClient.FrameHelper.removeChildren(this.explorer);
    UTILS.removeSelectedNavClass('terminus-dashboard-selected');
    widget.classList.add('terminus-dashboard-selected');
}

TerminusUI.prototype.toggleControl = function(){
  var self = this;
  this.buttons.client.addEventListener('click', function(){
    self.toggleDashboardWidget(this);
    self.drawControls();
    self.showServerMainPage();
  })
  this.buttons.explorer.addEventListener('click', function(){
    self.toggleDashboardWidget(this);
    self.drawExplorer();
  })
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
		TerminusClient.FrameHelper.removeChildren(this.messages);
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
        }
		this.messages.appendChild(md);
	}
};

TerminusUI.prototype.showViolations = function(vios, type){
	var nvios = new TerminusViolations(vios, this);
	if(this.messages){
		var cmsg = (type == "schema" ? " in Schema" : " in Document");
		TerminusClient.FrameHelper.removeChildren(this.messages);
		this.messages.appendChild(nvios.getAsDOM(cmsg));
	}
}

TerminusUI.prototype.showBusy = function(msg){
	this.showMessage(msg, "busy");
	if(this.viewer && typeof this.viewer.busy == "function") this.viewer.busy(msg);
};

TerminusUI.prototype.pseudoCapability = function(el){
	var pseuds = ["server", "db", "change-server", "api_explorer", "import_schema", "schema_format"];
	if(pseuds.indexOf(el) == -1) return false;
	return true;
}

TerminusUI.prototype.setOptions = function(opts){
	this.show_controls = opts && opts.controls ? opts.controls :
		["server", "db", "change-server", "schema_format",
			"import_schema", "class_frame", "create_database",
			"create_document", "get_document", "update_schema",
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
		var pins = ["gmaps", "quill", "select2"];
		for(var i = 0; i<pins.length; i++){
			if(self.piman.pluginAvailable(pins[i])){
				RenderingMap.addPlugin(pins[i]);
			}
		}
		self.redraw();
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
