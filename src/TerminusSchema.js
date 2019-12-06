/*
 * Draws the screen for viewing and updating the schema
 * and provides wrappers around the client's schema API
 */
const TerminusClassChooser = require('./client/TerminusClassChooser');
const TerminusDocumentViewer = require('./TerminusDocument');
const TerminusHTMLViewer = require('./html/TerminusHTMLViewer');
const UTILS=require('./Utils')
const TerminusClient = require('@terminusdb/terminus-client');

function TerminusSchemaViewer(ui){
	this.ui = ui;
	this.mode = "view";
	this.format = "turtle";
	this.confirm_before_update = false;
	this.thv = new TerminusHTMLViewer(this.ui.client);
	let WOQL = TerminusClient.WOQL;
	this.woql = WOQL;
}

TerminusSchemaViewer.prototype.changeHeaders = function() {
	var table = this.woql.table();
	table.column('Comment').header('Description');
	return table;
}

TerminusSchemaViewer.prototype.setGraphSize = function(){
	var graph = this.woql.graph();
	graph.source("v:Subject");
	var licon2 = { color: [255,255,25], weight: 100, unicode: "\uf2bb", size:2 };
	graph.edge("v:Subject", "v:Object").icon(licon2);
	graph.width(1223);
	return graph;
}

TerminusSchemaViewer.prototype.getOWLView = function(){
	this.mode = 'view'; // reset mode
	this.loadSchema();
}

TerminusSchemaViewer.prototype.appendRuleViews = function(){
	this.view.appendChild(UTILS.getHeaderDom('Classes'));
	this.appendClassViews(this.woql.table());
	this.appendClassViews(this.woql.graph());
	this.view.appendChild(UTILS.getHeaderDom('Properties'));
	this.appendPropertyViews(this.woql.table());
	this.appendPropertyViews(this.woql.graph());
}

TerminusSchemaViewer.prototype.appendPropertyViews = function(config){
	this.qprops.first();
	var n = this.thv.showResult(this.qprops, config, false);
	this.view.appendChild(n);
}

TerminusSchemaViewer.prototype.appendClassViews = function(config){
	this.qclasses.first();
	var n = this.thv.showResult(this.qclasses, config, false);
	this.view.appendChild(n);
}

TerminusSchemaViewer.prototype.getAllProperties = function(){
	let query = this.woql.from(this.ui.client.connectionConfig.dbURL())
						 .limit(25)
						 .start(0)
						 .propertyMetadata();
    var self = this;
    query.execute(this.ui.client).then((results) => {
		let qres = new TerminusClient.WOQLResult(results, query);
		self.qprops = qres;
		this.view.appendChild(UTILS.getHeaderDom('Table & Graph View of Properties'));
		var table = self.changeHeaders();
		var graph = self. setGraphSize();
		self.appendPropertyViews(table);
		self.appendPropertyViews(graph);
	})
}

TerminusSchemaViewer.prototype.getAllClasses = function(){
	let query = this.woql.from(this.ui.client.connectionConfig.dbURL())
						 .limit(25)
						 .start(0)
						 .classMetadata();
    var self = this;
    query.execute(this.ui.client).then((results) => {
		let qres = new TerminusClient.WOQLResult(results, query);
		self.qclasses = qres;
		self.view.appendChild(UTILS.getHeaderDom('Table & Graph View of Classes'));
		var table = self.changeHeaders();
		var graph = self. setGraphSize();
		self.appendClassViews(table);
		self.appendClassViews(graph);
	})
}

TerminusSchemaViewer.prototype.defineViewAction = function(a, view){
	TerminusClient.FrameHelper.removeChildren(this.view);
	UTILS.setSelectedSubMenu(a);
	switch(view){
		case 'table':
			this.appendRuleViews();
		break;
		case 'owl':
			this.getOWLView();
		break;
		default:
			console.log('Invalid view passed in TerminusSchema.js')
		break;
	}
}

TerminusSchemaViewer.prototype.getTabs = function(view){
	var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    //if(navConfig.defaultSelected) a.classList.add('terminus-selected');
    var self = this;
    a.addEventListener("click", function(){
        self.defineViewAction(this, view);
    })
	if(view == 'owl')
		var t = view.toUpperCase();
	else var t = view.charAt(0).toUpperCase() + view.slice(1)
	a.appendChild(document.createTextNode(t + ' View'));
    return a;
}

TerminusSchemaViewer.prototype.getSchemaViews = function(){
	var ul = document.createElement('ul');
    ul.setAttribute('class', 'terminus-ul-horizontal');
	var tview = this.getTabs('table');
	tview.classList.add('terminus-submenu-selected'); // default view is table
	ul.appendChild(tview);
	ul.appendChild(this.getTabs('owl'));
	this.controldom.appendChild(ul);
	this.getAllClasses();
	this.getAllProperties();
}

/*
 * Retrieves schema from API and writes the response into the page
 */
TerminusSchemaViewer.prototype.getAsDOM = function(){
	this.holder = document.createElement("div");
	this.controldom = document.createElement("div");
	this.controldom.setAttribute("class", "terminus-schema-controls");
	this.view = document.createElement("div");
	this.view.setAttribute("class", "terminus-schema-view");
	this.getSchemaViews();
	this.pagedom = document.createElement("div");
	this.pagedom.setAttribute("class", "terminus-schema-viewer");
	//this.loadSchema();
	this.holder.appendChild(this.controldom);
	this.controldom.appendChild(this.view);
	this.holder.appendChild(this.pagedom);
	return this.holder;
}

TerminusSchemaViewer.prototype.loadSchema = function(msg, msgtype){
	var self = this;
	this.ui.showBusy("Fetching Database Schema");
	this.ui.client.getSchema(false, {"terminus:encoding": "terminus:" + this.format})
	.then(function(response){
		self.ui.clearBusy();
		self.schema = response;
		self.refreshPage(msg, msgtype);
	})
	.catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusSchemaViewer.prototype.resetControlDOM = function(){
	TerminusClient.FrameHelper.removeChildren(this.view);
	if(this.mode == "edit"){
		this.view.appendChild(this.getSchemaSaveButtons());
	}
	else if(this.mode == "import"){
		this.view.appendChild(this.getSchemaImportActionButtons());
	}
	else if(this.mode == "class_frame"){
		if(this.ui.showControl("get_schema")){
			this.view.appendChild(this.getShowSchemaButton());
		}
		if(this.ui.showControl("class_frame")){
			this.view.appendChild(this.getClassFrameChooser());
		}
	}
	else if(this.mode == "view"){
		if(this.ui.showControl("update_schema")){
			this.view.appendChild(this.getSchemaEditButton());
		}
		if(this.ui.showControl("import_schema")){
			this.view.appendChild(this.getImportButton());
		}
		if(this.ui.showControl("add_new_library")){
			this.view.appendChild(this.getNewLibaryButton());
		}
		if(this.ui.showControl("class_frame")){
			this.view.appendChild(this.getClassFrameChooser());
		}
	}
}
/*
TerminusSchemaViewer.prototype.getFormatChoices = function(){
	var fc = document.createElement("select");
	fc.setAttribute("class", "terminus-form-select terminus-schema-format terminus-type-select");
	var tc = document.createElement("option");
	tc.setAttribute("class", "terminus-schema-turtle");
	tc.value = "turtle";
	tc.appendChild(document.createTextNode("Turtle"));
	if(this.format == "turtle") tc.selected = true;
	fc.appendChild(tc);
	var tj = document.createElement("option");
	tj.setAttribute("class", "terminus-schema-jsonld");
	tj.value = "jsonld";
	tj.appendChild(document.createTextNode("Json LD"));
	if(this.format == "jsonld") tj.selected = true;
	fc.appendChild(tj);
	var self = this;
	fc.addEventListener("change", function(e){
		self.format = this.value;
		self.loadSchema();
	});
	return fc;
}
*/

TerminusSchemaViewer.prototype.refreshPage = function(msg, msgtype){
	if(this.view) {
		this.resetControlDOM();
		this.refreshMainPage(msg, msgtype);
	}
	/*if(this.controldom)	this.resetControlDOM();
	if(this.pagedom) this.refreshMainPage(msg, msgtype);*/
}

TerminusSchemaViewer.prototype.refreshMainPage = function(msg, msgtype){
	TerminusClient.FrameHelper.removeChildren(this.pagedom);
	if(this.mode == 'view'){
		this.view.appendChild(this.getSchemaViewDOM());
	}
	else if(this.mode == "edit"){
		this.view.appendChild(this.getSchemaEditDOM());
	}
	else if(this.mode == "import"){
		this.view.appendChild(this.getSchemaImportDOM());
	}
	else if(this.mode == "class_frame"){
		this.view.appendChild(this.getClassFrameDOM());
	}
	if(msg){
		this.ui.showMessage(msg, msgtype);
	}
}

TerminusSchemaViewer.prototype.getSchemaSaveButtons = function(){
	var ssb = document.createElement("span");
	ssb.setAttribute("class", "terminus-schema-save-buttons");
	ssb.appendChild(this.getCancelButton());
	ssb.appendChild(this.getSaveButton());
	return ssb;
}

TerminusSchemaViewer.prototype.getSchemaImportActionButtons = function(){
	var ssb = document.createElement("span");
	ssb.setAttribute("class", "terminus-schema-import-buttons");
	ssb.appendChild(this.getCancelButton(true));
	ssb.appendChild(this.getImportSaveButton());
	return ssb;
}

TerminusSchemaViewer.prototype.getShowSchemaButton = function(){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		self.mode = "view";
		self.refreshPage();
	}
	return this.getSchemaButton("View Schema", "get_schema", func);
}

TerminusSchemaViewer.prototype.getImportPreviewButton = function(){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		self.mode = "preview";
		self.refreshPage();
	}
	return this.getSchemaButton("Preview", "preview", func);
}

TerminusSchemaViewer.prototype.getCancelButton = function(is_import){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		self.mode = "view";
		if(is_import){
			self.ui.redraw();
		}
		else {
			self.refreshPage();
		}
	}
	return this.getSchemaButton("Cancel", "cancel_update", func);
}

TerminusSchemaViewer.prototype.getImportSaveButton = function(){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		if(typeof self.doImport == "function"){
			self.doImport();
		}
	}
	return this.getSchemaButton("Import", "import_schema", func)
}

TerminusSchemaViewer.prototype.getSaveButton = function(){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		var text = self.schema_edit_dom.value;
		if(typeof(self.schema) == "object"){
			text = JSON.parse(text);
		}
		var opts = {};
		opts['terminus:encoding'] =  'terminus:' + self.format;
		if(!(TerminusClient.FrameHelper.empty(self.schema_edit_dom_name)))
			opts['schemaId'] = self.ui.client.connectionConfig.dbURL() + '/' + self.schema_edit_dom_name.value;
		else opts['schemaId'] = self.ui.client.connectionConfig.dbURL() + '/' + 'schema';
		return self.updateSchema(text, opts);
	}
	return this.getSchemaButton("Save", "update_schema", func);
}

TerminusSchemaViewer.prototype.getSchemaEditButton = function(){
	var self = this;
	var func = function(){
		self.mode = "edit";
		self.refreshPage();
	}
	return this.getSchemaButton("Edit", "update_schema", func);
}

TerminusSchemaViewer.prototype.getNewLibaryButton = function(){  //add_new_library
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		self.mode = "edit";
		self.refreshPage();
	}
	return this.getSchemaButton("New Library", "add_new_library", func);
}

TerminusSchemaViewer.prototype.getImportButton = function(){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		self.mode = "import";
		self.refreshPage();
	}
	return this.getSchemaButton("Import New Schema", "import_schema", func);
}

TerminusSchemaViewer.prototype.getSchemaButton = function(label, action, func){
	var opt = document.createElement("button");
	opt.appendChild(document.createTextNode(label));
	opt.setAttribute("class", "terminus-btn terminus-control-button terminus-schema-" + action);
	opt.addEventListener("click", func);
	return opt;
}

/*
 * Updates schema, then fetches updated version and updates the page with it
 */
TerminusSchemaViewer.prototype.updateSchema  = function(text, opts) {
	this.ui.showBusy("Updating Database Schema");
	var self = this;
	return this.ui.client.updateSchema(false, text, opts)
	.then(function(response){
		if(response['terminus:status'] && response['terminus:status'] == "terminus:success"){
			self.ui.showBusy("Retrieving updated schema");
			self.mode = "view";
			self.loadSchema("Successfully Updated Schema");
			self.ui.redraw();
		}
		else if(response['terminus:status'] && response['terminus:status'] == "terminus:failure"){
			self.ui.clearBusy();
			self.ui.showViolations(response['terminus:witnesses'], "schema");
		}
		else {
			throw new Error("Update Schema returned no terminus:status code");
		}
	})
	.catch(function(error){
		self.ui.clearBusy();
		if(error.data && error.data['terminus:witnesses']){
			self.ui.showViolations(error.data['terminus:witnesses'], "schema");
		}
		else {
			self.ui.showError(error);
		}
	});
}

/*
 * Imports a schema from the passed url
 * mode: replace | append
 */
TerminusSchemaViewer.prototype.load  = function(url, key, mode){
	var self = this;
	mode = (mode ? mode : "replace");
	this.ui.showBusy("Loading schema from " + url);
	var origurl = this.ui.client.connectionConfig.schemaURL();
	return this.ui.client.getSchema(url, {"terminus:user_key": key, "terminus:encoding" : "terminus:" + this.format})
	.then(function(response){
		var newschema = (mode == "append") ? self.appendSchema(response) : response;
		if(self.confirm_before_update){
			//reconnect to original db
			self.ui.showResult("Schema retrieved - click save to deploy");
			self.ui.client.connectionConfig.setSchemaURL(origurl);
			self.showConfirmPage(newschema);
		}
		else {
			self.ui.showBusy("Updating schema");
			self.ui.client.connectionConfig.setSchemaURL(origurl);
			self.updateSchema(newschema, {"terminus:encoding": "terminus:" + self.format}).then(function(response){
				self.mode = "view";
				self.ui.clearBusy();
				self.ui.redraw();
				self.ui.showResult("Successfully deployed new schema from " + url);
				return response;
			});
		}
	}).catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusSchemaViewer.prototype.appendSchema = function(s2){
	var nschema = this.schema;
	if(this.format == 'turtle'){
		nschema = this.schema + s2;
	}
	else if(this.format == 'jsonld'){
		for(var i in s2){
			nschema[i] = s2[i];
		}
	}
	return nschema;
}

TerminusSchemaViewer.prototype.getClassFrameChooser = function(){
	var np = document.createElement("span");
	np.setAttribute("class", "terminus-class frame-chooser");
	var termcc = new TerminusClassChooser(this.ui);
	termcc.empty_choice = "View Individual Class Frames";
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			self.cls = new_class;
			if(self.mode != "class_frame"){
				self.mode = "class_frame";
				self.refreshPage();
			}
			else {
				self.refreshMainPage();
			}
		}
	}
	var tcdom = termcc.getAsDOM();
	np.appendChild(tcdom);
	return np;
}

TerminusSchemaViewer.prototype.getClassFrameDOM = function(){
	var np = document.createElement("div");
	np.setAttribute("class", "terminus-schema-page terminus-schema-classframe-page");
	var docviewer = new TerminusDocumentViewer(this.ui, "model");
	docviewer.loadCreateDocument(this.cls);
	docviewer.page_config = "model";
	np.appendChild(docviewer.getAsDOM());
	return np;
}

TerminusSchemaViewer.prototype.showConfirmPage = function(newschema){
	this.schema = newschema;
	this.confirm_before_update = false;
	this.mode = "edit";
	this.refreshPage("Confirm new schema");
}

TerminusSchemaViewer.prototype.getSchemaNameInputDOM = function(np){
	var label = document.createElement('label');
    label.setAttribute('class', 'terminus-control-label');
	label.setAttribute('for', 'basicinput');
    label.appendChild(document.createTextNode('Schema name:'));
	var sid = document.createElement('input');
	sid.setAttribute('class', 'terminus-input-text terminus-schema-id-display');
	sid.setAttribute('placeholder', 'Enter schema name');
	np.appendChild(label);
	np.appendChild(sid);
	return sid;
}

TerminusSchemaViewer.prototype.getSchemaEditDOM = function(){
	var np = document.createElement("div");
	np.setAttribute("class", "terminus-schema-page terminus-schema-edit-page");
	if(this.ui.showControl("add_new_library")) var sid = this.getSchemaNameInputDOM(np);
	var ipval = document.createElement("textarea");
	ipval.setAttribute("class", "terminus-schema-edit terminus-schema-textarea");
	ipval.setAttribute("width", "100%");
	ipval.setAttribute("style", "min-width: 400px; min-height: 400px;");
	if(typeof(this.schema) == "string"){
		ipval.innerHTML = this.schema;
	}
	else if(typeof (this.schema) == "object") {
		ipval.innerHTML = JSON.stringify(this.schema, 0, 4);
	}
	if(this.ui.showControl("add_new_library")) this.schema_edit_dom_name = sid;
	this.schema_edit_dom = ipval;
	np.appendChild(ipval);
	UTILS.stylizeEditor(this.ui, ipval, 'schema', 'turtle');
	return np;
}

TerminusSchemaViewer.prototype.getSchemaViewDOM = function(){
	var self = this;
	var np = document.createElement("div");
	np.setAttribute("class", "terminus-schema-page terminus-schema-view-page");
	var ipval = document.createElement("pre");
	ipval.setAttribute("class", "terminus-schema-view terminus-scheme-pre");
	if(typeof(this.schema) == "string"){
		var txt = this.schema.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
		ipval.innerHTML = txt;
	}
	else if(typeof (this.schema) == "object") {
		ipval.innerHTML = JSON.stringify(this.schema, 0, 4);
	}
	var cm = UTILS.stylizeCodeDisplay(this.ui, ipval, np, 'turtle');
	if(!cm) np.appendChild(ipval);
	return np;
}

TerminusSchemaViewer.prototype.getSchemaImportDOM = function(){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-form-border terminus-schema-page terminus-schema-import-page");


	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-url-loader-input terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("URL"));
	sci.appendChild(slab);
	var inpUrl  = document.createElement("input");
	inpUrl.setAttribute("type", "text");
	inpUrl.setAttribute("class", "terminus-form-value terminus-input-text terminus-form-url terminus-url-connect");
	inpUrl.setAttribute("placeholder", "Enter URL of DB to import from");
	sci.appendChild(inpUrl);
	scd.appendChild(sci);

	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var klab = document.createElement("span");
	klab.setAttribute("class", "terminus-url-loader-input terminus-form-label  terminus-control-label terminus-import_mode-input");
	klab.appendChild(document.createTextNode("Import Mode"));
	sci.appendChild(klab);
	var modes = document.createElement("select");
	modes.setAttribute("class", "terminus-form-select");

	var overwrite = document.createElement("option");
	overwrite.value = "replace";
	overwrite.appendChild(document.createTextNode("Replace Mode"))
	modes.appendChild(overwrite);
	var append = document.createElement("option");
	append.value = "append";
	append.appendChild(document.createTextNode("Append Mode"))
	modes.appendChild(append);
	modes.setAttribute("class", "terminus-form-select terminus-import-mode");
	sci.appendChild(klab);
	sci.appendChild(modes);
	scd.appendChild(sci);

	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var klab = document.createElement("span");
	klab.setAttribute("class", "terminus-form-label terminus-url-key-input terminus-control-label");
	klab.appendChild(document.createTextNode("Key"))
	var key = document.createElement("input");
	key.setAttribute("type", "text");
	key.setAttribute("class", "terminus-form-value terminus-input-text terminus-url-key");
	sci.appendChild(klab);
	sci.appendChild(key);
	scd.appendChild(sci);
	var self = this;
	this.doImport = function(){
		if(inpUrl.value){
			self.load(inpUrl.value, key.value, modes.value);
		}
	}
	return scd;
}

module.exports=TerminusSchemaViewer
