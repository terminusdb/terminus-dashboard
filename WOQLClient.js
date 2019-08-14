/**
 * @file Javascript WOQL client object 
 * @license Apache Version 2
 * @summary Simple Javascript Client for accessing the Terminus DB API
 */
function WOQLClient(params){
	//current connection context variables
	this.server = (params && params.server ? params.server : false);
	this.dbid = (params && params.server && params.db ? params.db : false);
	this.docid = (params && params.document && params.document ? params.document : false);
	//internal connection registry
	this.connection = {};
	if(this.server && params.key){
		this.setClientKey(this.server, params.key);
	}
	//client configuration options
	this.connected_mode = (params && params.connected_mode ? params.connected_mode : "connected")
	this.include_key = (params && params.include_key ? params.include_key : true);
	this.client_checks_capabilities = (params && params.client_checks_capabilities ? params.client_checks_capabilities : false);
}

/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the terminus:ServerCapability document returned in the connection register
 * which stores, the url, key, capabilities, and database meta-data for the connected server
 * 
 * If the curl argument is false or null, the this.server will be used if present, or the promise will be rejected. 
 */
WOQLClient.prototype.connect = function(curl, key){
	curl = (curl ? curl : this.server);
	if(!this.setServer(curl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(curl, "connect")));
	}
	if(curl.lastIndexOf('/') != curl.length-1){
		curl += "/";
	}
	if(key) {
		this.setClientKey(curl, key);
	}
	var self = this;
	return this.dispatch(curl, "connect").then(function(response){
		self.setConnectionCapabilities(curl, response);
		self.server = curl;
		return response;
	});
}

/**
 * Create a Terminus Database by posting a terminus:Database document to the Terminus API
 * 
 * The dburl argument can be 1) a valid URL of a terminus database or 2) a valid Terminus database id or 3) can be omitted
 * 		in case 2) the current server will be used, 
 * 		in case 3) the database id will be set from the @id field of the terminuse:Database document.
 * 
 * The second (details) argument contains a terminus:Database document with a mandatory rdfs:label field and an optional rdfs:comment field.
 * The third (key) argument contains an optional API key 
 */
WOQLClient.prototype.createDatabase = function(dburl, details, key){
	if(dburl && !this.setDB(dburl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(dburl, "Create Database")));
	}
	else if(details && details["@id"] && !this.setDB(details["@id"], details["@context"])){
        return Promise.reject(new URIError(this.getInvalidURIMessage(details["@id"], "Create Database")));
	}
	dburl = this.server + this.dbid;
	details = this.makeDatabaseDocumentConsistentWithURL(details, dburl);
	if(key) {
		details.key = key;
	}
	var self = this;
	return this.dispatch(dburl, "create_database", details)
	.then(function(response){
		self.addDBToConnection(response);
		return response;		
	});
}

/**
 * Deletes a Database 
 * 
 * The first (dburl) argument can 1) a valid URL of a terminus database or 2) a valid database id or 3) ommitted
 * 		in case 2) the current server will be used, and in case 3) the current server and database will be used
 * The second argument (opts) is an options json - no options are currently supported for this function
 */
WOQLClient.prototype.deleteDatabase = function(dburl, opts){
	if(dburl && !this.setDB(dburl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(dburl, "Delete Database")));
	}
	dburl = this.server + this.dbid;
	var self = this;
	return this.dispatch(dburl, "delete_database", opts).
	then(function(response){
		self.removeDBFromConnection();
		return response;
	});	
}

/**
 * Retrieves the schema of the specified database
 * 
 * The first (schurl) argument can be 1) a valid URL of a terminus database or 2) a valid database id or 3) omitted, 
 * 		in case 2) the current server will be used, and in case 3) the current server and database will be used
 * the second argument (opts) is an options json - 
 * 		opts.format is optional and defines which format is requested (*json / turtle)
 * 		opts.key is an optional API key
 */
WOQLClient.prototype.getSchema = function(schurl, opts){
	if(schurl && this.setSchemaURL(schurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(schurl, "Get Schema")));
	}
	schurl = this.server + this.dbid + "/schema";
	return this.dispatch(schurl, "get_schema", opts);
}

/**
 * Updates the Schema of the specified database
 * 
 * The first (schurl) argument can be 1) a valid URL of a terminus database or 2) a valid database id or 3) omitted, 
 * 		in case 2) the current server will be used, and in case 3) the current server and database will be used
 * The second argument (doc) is a valid owl ontology in json-ld or turtle format
 * the third argument (opts) is an options json - 
 * 		opts.format is used to specify which format is being used (*json / turtle)
 * 		opts.key is an optional API key
 */
WOQLClient.prototype.updateSchema = function(schurl, doc, opts){
	if(schurl && this.setSchemaURL(schurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(schurl, "Update Schema")));
	}
	schurl = this.server + this.dbid + "/schema";
	doc = this.addOptionsToDocument(doc, opts);
	return this.dispatch(schurl, "update_schema", doc);
}

/**
 * Creates a new document in the specified database
 * 
 * The first (docurl) argument can be 
 * 1) a valid URL of a terminus database (an id will be randomly assigned) or 
 * 2) a valid URL or of a terminus document (the document will be given the passed URL) or 
 * 3) a valid terminus document id (the current server and database will be used) 
 * 4) can be ommitted (the URL will be taken from the document if present)
 * The second argument (doc) is a valid document in json-ld 
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.createDocument = function(docurl, doc, opts){
	if(docurl && !this.setDocument(docurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(docurl, "Create Document")));
	}
	else if(doc && doc["@id"] && !this.setDocument(doc["@id"], doc["@context"])){
        return Promise.reject(new URIError(this.getInvalidURIMessage(doc["@id"], "Create Document")));
	}
	docurl = this.server + this.dbid + "/document/" + (this.docid ? this.docid : "");
	doc = this.addOptionsToDocument(this.makeDocumentConsistentWithURL(docurl, doc), opts);
	return this.dispatch(docurl, "create_document", doc);
}

/**
 * Retrieves a document from the specified database
 * 
 * The first (docurl) argument can be 
 * 1) a valid URL of a terminus document or 
 * 2) a valid ID of a terminus document in the current database 
 * the second argument (opts) is an options json - 
 * 		opts.key is an optional API key
 * 		opts.shape is frame | *document 
 */
WOQLClient.prototype.getDocument = function(docurl, opts){
	if(docurl && (!this.setDocument(docurl) || !this.docid)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(docurl, "Get Document")));
	}
	docurl = this.server + this.dbid + "/document/" + this.docid;
	return this.dispatch(docurl, "get_document", opts);
}

/**
 * Updates a document in the specified database with a new version
 * 
 * The first (docurl) argument can be 
 * 1) a valid URL of a terminus document or 
 * 2) a valid ID of a terminus document in the current database or
 * 3) ommitted in which case the id will be taken from the document @id field
 * the second argument (doc) is a document in json-ld format
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.updateDocument = function(docurl, doc, opts){
	if(docurl && !this.setDocument(docurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(docurl, "Update Document")));
	}
	else if(doc && doc["@id"] && !this.setDocument(details["@id"], details["@context"])){
        return Promise.reject(new URIError(this.getInvalidURIMessage(doc["@id"], "Update Document")));
	}
	docurl = this.server + this.dbid + "/document/" + this.docid;
	doc = this.addOptionsToDocument(this.makeDocumentConsistentWithURL(docurl, doc), opts);
	return this.dispatch(docurl, "update_document", doc);
}

/**
 * Deletes a document from the specified database
 * 
 * The first (docurl) argument can be 
 * 1) a valid URL of a terminus document or 
 * 2) a valid ID of a terminus document in the current database 
 * 3) omitted - the current document will be used 
 * the second argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.deleteDocument = function(docurl, opts){
	if(docurl && (!this.setDocument(docurl) || !this.docid)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(docurl, "Delete Document")));
	}
	docurl = this.server + this.dbid + "/document/" + this.docid;
	return this.dispatch(docurl, "delete_document", opts);
}

/**
 * Executes a read-only WOQL query on the specified database and returns the results
 * 
 * The first (qurl) argument can be 
 * 1) a valid URL of a terminus database or 
 * 2) omitted - the current database will be used 
 * the second argument (woql) is a woql select statement encoded as a string
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.select = function(qurl, woql, opts){
	if(qurl && this.setQueryURL(qurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(qurl, "Select")));
	}
	qurl = this.server + this.dbid + "/woql";
	woql = this.addOptionsToWOQL(woql, opts);
	return this.dispatch(qurl, "woql_select", woql);
}

/**
 * Executes a WOQL query on the specified database which updates the state and returns the results
 * 
 * The first (qurl) argument can be 
 * 1) a valid URL of a terminus database or 
 * 2) omitted - the current database will be used 
 * the second argument (woql) is a woql select statement encoded as a string
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.update = function(qurl, woql, opts){
	if(qurl && this.setQueryURL(qurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(qurl, "Update")));
	}
	qurl = this.server + this.dbid + "/woql";
	woql = this.addOptionsToWOQL(woql, opts);
	return this.dispatch(qurl, "woql_update", woql);
}

/**
 * Retrieves a WOQL query on the specified database which updates the state and returns the results
 * 
 * The first (cfurl) argument can be 
 * 1) a valid URL of a terminus database or 
 * 2) omitted - the current database will be used 
 * the second argument (cls) is the URL / ID of a document class that exists in the database schema
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.getClassFrame = function(cfurl, cls, opts){
	if(cfurl && this.setClassFrameURL(cfurl)){
        return Promise.reject(new URIError(this.getInvalidURIMessage(cfurl, "Get Class Frame")));
	}
	cfurl = this.server + this.dbid + "/frame";
	if(!opts) opts = {};
	opts["class"] = cls;
	return this.dispatch(cfurl, "class_frame", opts);
}

/*
 * Utility functions for setting and parsing urls and determining the current server, database and document
 */
WOQLClient.prototype.setServer = function(input_str, context){
	let parser = new TerminusIDParser(input_str, context);
	if(parser.parseServerURL()){
		this.server = parser.server();
		return true;
	}
	return false;	
}

WOQLClient.prototype.setDB = function(input_str, context){
	let parser = new TerminusIDParser(input_str, context);
	if(parser.parseDBID()){
		if(parser.server()) this.server = parser.server(); 
		this.dbid = parser.dbid();
		return true;
	}
	return false;
}

WOQLClient.prototype.setSchemaURL = function(input_str, context){
	let parser = new TerminusIDParser(input_str, context);
	if(parser.parseSchemaURL()){
		if(parser.server()) this.server = parser.server(); 
		this.dbid = parser.dbid();
		this.docid = false;
	}
	return false;
}

WOQLClient.prototype.setDocument = function(input_str, context){
	let parser = new TerminusIDParser(input_str, context);
	if(parser.parseDocumentURL()){
		if(parser.server()) this.server = parser.server(); 
		if(parser.dbid()) this.dbid = parser.dbid();
		if(parser.docid()) this.docid = parser.docid();
	}
	return false;
}

WOQLClient.prototype.setQueryURL = function(input_str, context){
	let parser = new TerminusIDParser(input_str, context);
	if(parser.parseQueryURL()){
		if(parser.server()) this.server = parser.server(); 
		this.dbid = parser.dbid();
		this.docid = false;
	}	
	return false;
}

WOQLClient.prototype.setClassFrameURL = function(input_str, context){
	let parser = new TerminusIDParser(input_str, context);
	if(parser.parseClassFrameURL()){
		if(parser.server()) this.server = parser.server(); 
		this.dbid = parser.dbid();
		this.docid = false;
	}	
	return false;
}

/*
 * Utility functions for changing the state of connections with Terminus servers
 */
WOQLClient.prototype.setClientKey = function(curl, key){
	key = key.trim();
	if(key){
		if(typeof this.connection[curl] == "undefined"){
			this.connection[curl] = {};
		}
		this.connection[curl]['key'] = key;
	}
}

WOQLClient.prototype.setConnectionCapabilities = function(curl, capabilities){
	if(typeof this.connection[curl] == "undefined"){
		this.connection[curl] = {};
	}
	this.connection[curl]['capabilities'] = capabilities;
}

WOQLClient.prototype.addDBToConnection = function(createdb_response, dbid){
	dbid = (dbid ? dbid : this.dbid);
	this.connection[this.server][dbid] = createdb_response;
}

WOQLClient.prototype.removeDBFromConnection = function(dbid){
	dbid = (dbid ? dbid : this.dbid);
	delete(this.connection[this.server][dbid]); 
	this.dbid = false;
}

/*
 * Utility functions for adding standard fields to API arguments
 */
WOQLClient.prototype.addOptionsToWOQL = function(woql, opts){
	if(opts && opts.key){ woql.key = opts.key };
	return woql;
}

WOQLClient.prototype.addOptionsToDocument = function(doc, opts){
	if(opts && opts.key){ doc.key = doc.key };
	return doc;
}

WOQLClient.prototype.addKeyToPayload = function(payload){
	if(payload && payload.key){
		payload["terminus:user_key"] = payload.key;
		delete(payload["key"]);
	}
	else if(this.connection[this.server] && this.connection[this.server].key ){
		if(!payload) payload = {};
		payload["terminus:user_key"] = this.connection[this.server].key; 			
	}
	return payload;
} 

WOQLClient.prototype.makeDatabaseDocumentConsistentWithURL = function(doc, dburl){
	doc["terminus:id"] = { "@type": "xsd:anyURI", "@value": dburl };
	return doc;
}

WOQLClient.prototype.makeDocumentConsistentWithURL = function(doc, dburl){
	doc["@id"] = dburl;
	return doc;
}

/*
 * Utility functions for retrieving error messages and storing error state
 */
WOQLClient.prototype.getAccessDeniedMessage = function(url, call, err){
	return "Access Denied " + this.getErrorAsMessage(url, api, err);
}

WOQLClient.prototype.getInvalidURIMessage = function(url, call){
	let str = "Invalid argument to " + call + ". " + url + " is not a valid Terminus DB API endpoint";
	return str;
}

WOQLClient.prototype.parseAPIError = function(response){
	var err = {};
	err.status = response.status;
	err.type = response.type;
	err.body = response.body;
	err.url = response.url;
	err.headers = response.headers;
	err.redirected = response.redirected;
	return err;
}

WOQLClient.prototype.accessDenied = function(url, action){
    var err = {};
    err.status = 403;
    err.url = url;
    err.type = "client";
    err.action = action;
    err.body = err.action + " not permitted for " + url;
    return err;
}

WOQLClient.prototype.getAPIErrorMessage = function(url, api, err){
	return "API Error " + this.getErrorAsMessage(url, api, err);
}

WOQLClient.prototype.getErrorAsMessage = function(url, api, err){
	let str = "Code: " + err.status;
	if(err.body) str += ", Message: " + err.body;
	if(err.action) str += ", Action: " + err.action;
	if(err.type) str += ", Type: " + err.type;
	if(url) str += ", url: " + url;
	if(api.method) str += ", method: " + api.method;
	return str;
}

/*
 * Functions for checking capabilities by the client before making API calls
 */
WOQLClient.prototype.capabilitiesPermit = function(url, action, payload){
	if(!this.connectionMode() || this.client_checks_capabilities !== true){
		return true;
	}
	let caps = this.connection[this.server].capabilities;
	if(this.actionCovered(action, caps['terminus:action'], caps['terminus:authority_scope'], caps.context)){
		return true;
	}
	this.error = this.accessDenied(url, action);
	return false;
}

WOQLClient.prototype.actionCovered = function(action, actions, scope, context){
	if(actions && actions.length && scope && scope.length){
		let action_covered = false;
		for(var i = 0; i<actions.length; i++){
			if(actions[i]["@id"] && actions[i]["@id"].split(":")[1] == action) {
				action_covered = true;
				continue;
			}
		}
		if(!action_covered) return false;
		for(var i = 0; i<scope.length; i++){
			if(scope[i]["@type"] && scope[i]["@type"] == "terminus:Server") return true;
			else if(scope[i]["@type"] && scope[i]["@type"] == "terminus:Database") {
				if(scope[i]["@id"] && scope[i]["@id"] == this.dbCapabilityID(context)){
					return true;
				}
			}
		}	
	}
	return false;
}

WOQLClient.prototype.dbCapabilityID = function(context){
	return "doc:" + this.dbid;
}

WOQLClient.prototype.serverConnected = function(){
	return (typeof this.connection[this.server] != "undefined");
}

WOQLClient.prototype.connectionMode = function(){
	return (this.connected_mode == "connected");
}

WOQLClient.prototype.includeKey = function(){
	return (this.include_key === true);
}

/*
 * Functions for packaging up arguments for sending to server API and dispatching them as Promises
 */
WOQLClient.prototype.URIEncodePayload = function(pl){
	var str = "";
	var first = true;
	for(var k in pl){
		if(!first){
			str += "&";
		}
		first = false;
		if(typeof pl[k] == "object"){
			var fobj = true;
			for(var key in pl[k]){
				if(!fobj){
					str += "&";
				}
				fobj = false;
				str += encodeURIComponent(k + '[' + key + ']') + "=" + encodeURIComponent(pl[k][key]);				
			}	
		}
		else {
			str += encodeURIComponent(k) + "=" + encodeURIComponent(pl[k]);		
		}
	}
	return str;
}

WOQLClient.prototype.dispatch = function(url, action, payload){
	var res = false;
	if(action != "connect" && this.connectionMode() && !this.serverConnected()){
		let key = (payload && payload.key) ? payload.key : false;
		var self = this;
		return this.connect(this.server, key)
		.then(function(response){
			if(key) delete(payload['key']);
			self.dispatch(url, action, payload);
			return response;
		});
	}
	if(!this.capabilitiesPermit(url, action, payload)){
		return Promise.reject(new Error(this.getAccessDeniedMessage(url, api, this.error)));
	}
	if(this.includeKey()){
		payload = this.addKeyToPayload(payload);
	}
	let api = {
        mode: 'cors', // no-cors, cors, *same-origin
        credentials: 'include', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
        referrer: 'client', // no-referrer, *client
    };
	//read only API calls - use GET
	if(action == "connect" || action == "get_schema" || action == "class_frame" || action == "woql_select" || action == "get_document"){
		api.method = 'GET'; 
		url += "?" + this.URIEncodePayload(payload);
	}
	//delete API calls
	else if(action == "delete_database" || action == "delete_document"){
		api.method = 'DELETE'; 
		api.cache = 'no-cache'; // *default, no-cache, reload, force-cache, only-if-cached
	}
	else if(action == "create_database", "update_schema", "create_document", "update_document", "woql_update"){
		api.method = 'POST';
		api.cache = 'no-cache'; 
		api.headers = { 'Content-Type': 'application/json'},
        api.body = JSON.stringify(payload); // body data type must match "Content-Type" header
	}
	return fetch(url, api).then(function(response) {
		if(response.ok) {
			if(api.method == "DELETE" || (payload && payload.responseType  && payload.responseType == "text")) return response.text();
			return response.json();
		}
		else {
			this.error = this.parseAPIError(response);
            return Promise.reject(new Error(this.getAPIErrorMessage(url, api, this.error)));
		}
	});
}

/*
 * Helper class for parsing and decomposing Terminus URLs / dealing with prefixed URLs 
 */
function TerminusIDParser(input_str, context){
	this.contents = input_str.trim();
	this.context = context;
	this.server_url = false;
	this.db = false;
	this.doc = false;
}

TerminusIDParser.prototype.server = function(){
	return this.server_url;
} 

TerminusIDParser.prototype.dbid = function(){
	return this.db;
} 

TerminusIDParser.prototype.docid = function(){
	return this.doc;
} 

TerminusIDParser.prototype.parseServerURL = function(str){
	str = (str ? str : this.contents);
	if(this.validURL(str)){
		this.server_url = str;
	}
	else if(this.context && this.validPrefixedURL(str, context)){
		this.server_url = this.expandPrefixed(str, context);
	}
	if(this.server_url && this.server_url.lastIndexOf("/") != this.server_url.length-1){
		this.server_url += "/";
	}
	return this.server_url;
}

TerminusIDParser.prototype.parseDBID = function(str){
	str = (str ? str : this.contents);
	if(this.context && this.validPrefixedURL(str, context)){
		str = this.expandPrefixed(str, context);		
	}
	if(this.validURL(str)){
		if(str.lastIndexOf("/") == str.length-1) str = str.substring(0, str.length-1);		//trim trailing slash
		let surl = str.substring(0, str.lastIndexOf("/"));
		let dbid = str.substring(str.lastIndexOf("/") + 1);
		if(this.parseServerURL(surl)){
			this.db = dbid; 
		}		
	}
	else if(this.validIDString(str)){
		this.db = str;		
	}
	return this.db;
}

TerminusIDParser.prototype.parseDocument = function(str){
	str = (str ? str : this.contents);
	if(this.context && this.validPrefixedURL(str, context)){
		str = this.expandPrefixed(str, context);		
	}
	if(this.validURL(str)){
		if(str.lastIndexOf("/document/") != -1) {
			this.doc = str.substring(str.lastIndexOf("/document/") + 11);
			str = str.substring(0, str.lastIndexOf("/document/"));
		}
		return this.parseDBID(str);
	}
	else if(this.validIDString(str)){
		this.doc = str;
		return true;
	}
	return false;
}

TerminusIDParser.prototype.parseSchemaURL = function(str){
	str = (str ? str : this.contents);
	if(this.context && this.validPrefixedURL(str, context)){
		str = this.expandPrefixed(str, context);
	}
	if(this.validURL(str)){
		str = this.stripOptionalPath(str, "schema");
	}
	return this.parseDBID(str);
}

TerminusIDParser.prototype.parseQueryURL  = function(str){
	str = (str ? str : this.contents);
	if(this.context && this.validPrefixedURL(str, context)){
		str = this.expandPrefixed(str, context);
	}
	if(this.validURL(str)){
		str = this.stripOptionalPath(str, "woql");
		str = this.stripOptionalPath(str, "query");
	}
	return this.parseDBID(str);
}

TerminusIDParser.prototype.parseClassFrameURL = function(str){
	str = (str ? str : this.contents);
	if(this.context && this.validPrefixedURL(str, context)){
		str = this.expandPrefixed(str, context);
	}
	if(this.validURL(str)){
		str = this.stripOptionalPath(str, "schema");
	}
	return this.parseDBID(str);
}

TerminusIDParser.prototype.validURL = function(str){
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return pattern.test(str);	
}

TerminusIDParser.prototype.validPrefixedURL = function(str, context){
	let parts = str.split(":");
	if(parts.length != 2) return false;
	if(parts[0].length < 1 || parts[1].length < 1) return false;
	if(context && context[parts[0]] && this.validIDString(parts[1])) return true;
	return false;
}

TerminusIDParser.prototype.validIDString = function(str){
	if(str.indexOf(" ") != -1 || str.indexOf("/") != -1) return false;
	return true;
}

TerminusIDParser.prototype.expandPrefixed = function(str, context){
	let parts = str.split(":");
	return context[parts[0]] + parts[1];	
}