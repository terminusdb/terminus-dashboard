/*
 * Draws the screen for viewing and updating the schema
 * and provides wrappers around the client's schema API
 */

function TerminusSchemaViewer(ui){
	this.ui = ui;
	this.mode = "view";
	this.format = "turtle";
	this.confirm_before_update = true;
}

/*
 * Retrieves schema from API and writes the response into the page
 */
TerminusSchemaViewer.prototype.getAsDOM = function(){
	this.holder = document.createElement("div");
	this.controldom = document.createElement("div");
	this.controldom.setAttribute("class", "terminus-schema-controls");
	this.pagedom = document.createElement("div");
	this.pagedom.setAttribute("class", "terminus-schema-viewer");
	this.loadSchema();
	this.holder.appendChild(this.controldom);
	this.holder.appendChild(this.pagedom);
	return this.holder;
}

TerminusSchemaViewer.prototype.loadSchema = function(){
	var self = this;
	this.ui.showBusy("Fetching Database Schema");
	this.ui.client.getSchema(false, {"terminus:encoding": "terminus:" + this.format})
	.then(function(response){
		self.ui.clearBusy();
		self.schema = response;
		self.refreshPage();
	})
	.catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusSchemaViewer.prototype.resetControlDOM = function(){
	FrameHelper.removeChildren(this.controldom);
	if(this.mode == "edit"){
		this.controldom.appendChild(this.getSchemaSaveButtons());
	}
	else if(this.mode == "import"){
		this.controldom.appendChild(this.getSchemaImportActionButtons());
	}
	else if(this.mode == "class_frame"){
		if(this.ui.showControl("get_schema")){
			this.controldom.appendChild(this.getShowSchemaButton());
		}
		if(this.ui.showControl("class_frame")){
			this.controldom.appendChild(this.getClassFrameChooser());
		}
	}
	else if(this.mode == "view"){
		if(this.ui.showControl("import_schema")){
			this.controldom.appendChild(this.getImportButton());
		}
		if(this.ui.showControl("update_schema")){
			this.controldom.appendChild(this.getSchemaEditButton());
		}
		if(this.ui.showControl("schema_format")){
			this.controldom.appendChild(this.getFormatChoices());
		}
		if(this.ui.showControl("class_frame")){
			this.controldom.appendChild(this.getClassFrameChooser());
		}
	}
}

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


TerminusSchemaViewer.prototype.refreshPage = function(){
	if(this.controldom) this.resetControlDOM();
	if(this.pagedom) this.refreshMainPage();
}

TerminusSchemaViewer.prototype.refreshMainPage = function(){
	FrameHelper.removeChildren(this.pagedom);
	if(this.mode == 'view'){
		this.pagedom.appendChild(this.getSchemaViewDOM());
	}
	else if(this.mode == "edit"){
		this.pagedom.appendChild(this.getSchemaEditDOM());
	}
	else if(this.mode == "import"){
		this.pagedom.appendChild(this.getSchemaImportDOM());
	}
	else if(this.mode == "class_frame"){
		this.pagedom.appendChild(this.getClassFrameDOM());
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
	ssb.appendChild(this.getCancelButton());
	ssb.appendChild(this.getImportPreviewButton());
	ssb.appendChild(this.getImportSaveButton());
	return ssb;
}

TerminusSchemaViewer.prototype.getShowSchemaButton = function(){
	var self = this;
	var func = function(){
		self.mode = "view";
		self.refreshPage();
	}
	return this.getSchemaButton("View Schema", "get_schema", func);
}

TerminusSchemaViewer.prototype.getImportPreviewButton = function(){
	var self = this;
	var func = function(){
		self.mode = "preview";
		self.refreshPage();
	}
	return this.getSchemaButton("Preview", "preview", func);
}

TerminusSchemaViewer.prototype.getCancelButton = function(){
	var self = this;
	var func = function(){
		self.mode = "view";
		self.refreshPage();
	}
	return this.getSchemaButton("Cancel", "cancel_update", func);
}

TerminusSchemaViewer.prototype.getImportSaveButton = function(){
	var self = this;
	var func = function(){
		if(typeof self.doImport == "function"){
			self.doImport();
		}
	}
	return this.getSchemaButton("Import", "import_schema", func)
}

TerminusSchemaViewer.prototype.getSaveButton = function(){
	var self = this;
	var func = function(){
		var text = self.schema_edit_dom.value;
		if(typeof(self.schema) == "object"){
			text = JSON.parse(text);
		}
		self.updateSchema(text);
	}
	return this.getSchemaButton("Save", "update_schema", func)
}

TerminusSchemaViewer.prototype.getSchemaEditButton = function(){
	var self = this;
	var func = function(){
		self.mode = "edit";
		self.refreshPage();
	}
	return this.getSchemaButton("Edit", "update_schema", func);
}

TerminusSchemaViewer.prototype.getImportButton = function(){
	var self = this;
	var func = function(){
		self.mode = "import";
		self.refreshPage();
	}
	return this.getSchemaButton("Import Schema", "import_schema", func);
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
TerminusSchemaViewer.prototype.updateSchema  = function(text, opts){
	this.ui.showBusy("Updating Database Schema");
	var self = this;
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

/*
 * Imports a schema from the passed url
 * mode: replace | append
 */
TerminusSchemaViewer.prototype.load  = function(url, key, mode){
	var self = this;
	mode = (mode ? mode : "replace");
	this.ui.showBusy("Loading schema from " + url);
	return this.ui.client.getSchema(url, {key: key, format: this.format})
	.then(function(response){
		var newschema = (mode == "append") ? self.appendSchema(response) : response;
		if(self.confirm_before_update){
			self.showConfirmPage(newschema);
		}
		else {
			self.ui.showBusy("Updating schema");
			self.updateSchema(false, newschema).then(function(response){
				self.ui.clearBusy();
				self.ui.showResult("Successfully deployed new schema from " + url);
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
	np.setAttribute("class", "terminus-classframe-chooser");
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

TerminusSchemaViewer.prototype.getSchemaEditDOM = function(){
	var np = document.createElement("div");
	np.setAttribute("class", "terminus-schema-page terminus-schema-edit-page");
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
	this.schema_edit_dom = ipval;
	np.appendChild(ipval);
	if(this.ui.pluginAvailable("codemirror")){
    var cm = new Codemirror(ipval, this.format);
		var ar = cm.colorizeTextArea('schema');
		cm.updateTextArea(ar);
    }
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
	if(this.ui.pluginAvailable("codemirror")){
    var cm = new Codemirror(ipval, this.format);
		var pr = cm.colorizePre();
		np.appendChild(pr);
  }
	else np.appendChild(ipval);
	return np;
}

TerminusSchemaViewer.prototype.getSchemaImportDOM = function(){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-schema-page terminus-schema-import-page");
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-form-label terminus-url-loader-input");
	lab.appendChild(document.createTextNode("URL"))
	var ip = document.createElement("input");
	ip.setAttribute("type", "text");
	ip.setAttribute("class", "terminus-form-value terminus-form-url terminus-url-connect");
	if(this.val){
		ip.value = this.val;
	}
	sci.appendChild(lab);
	sci.appendChild(ip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field");
	var klab = document.createElement("span");
	klab.setAttribute("class", "terminus-form-label terminus-import_mode-input");
	klab.appendChild(document.createTextNode("Import Mode"))
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
	sci.setAttribute("class", "terminus-form-field");
	var klab = document.createElement("span");
	klab.setAttribute("class", "terminus-form-label terminus-url-key-input");
	klab.appendChild(document.createTextNode("Key"))
	var key = document.createElement("input");
	key.setAttribute("type", "text");
	key.setAttribute("class", "terminus-form-value terminus-url-key");
	sci.appendChild(klab);
	sci.appendChild(key);
	scd.appendChild(sci);
	var self = this;
	this.doImport = function(){
		if(ip.value){
			self.load(ip.value, key.value, modes.value);
		}
	}
	return scd;
}
