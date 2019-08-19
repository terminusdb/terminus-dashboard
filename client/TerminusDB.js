/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
function TerminusDBController(ui){
	 this.ui = ui;
}

/*
 * Controller provides access to the server level functions (create/delete db) and db-level functions (schema, query, document)
 */
TerminusDBController.prototype.getAsDOM = function(){
	var self = this;
	var dbc = document.createElement("div");
	dbc.setAttribute("class", "terminus-db-controller");
	if(this.ui && this.ui.db()){
		var scd = document.createElement("div");
		scd.setAttribute("class", "terminus-field terminus-db-connection");
		var lab = document.createElement("span");
		lab.setAttribute("class", "terminus-label terminus-db-label");
		lab.appendChild(document.createTextNode("DB "));
		var val = document.createElement("span");
		val.setAttribute("class", "terminus-value terminus-db-value");
		var dbrec = this.ui.client.getDBRecord();
		var nm = (dbrec && dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
		val.appendChild(document.createTextNode(nm));
		scd.appendChild(lab);
		scd.appendChild(val);
		dbc.appendChild(scd);
		if(this.ui.showControl("db")){
			var nscd = document.createElement("button");
			nscd.setAttribute("class", "terminus-control-button terminus-db-home");
			nscd.appendChild(document.createTextNode("Database Home"));
			nscd.addEventListener("click", function(){
				self.ui.showDBMainPage();
			});
			dbc.appendChild(nscd);
		}
		if(this.ui.showControl("delete_database")){
			var dbut = document.createElement("button");
			dbut.setAttribute("class", "terminus-control-button terminus-delete-db-button");
			dbut.appendChild(document.createTextNode("Delete Database"));
			dbut.addEventListener("click", function(){
				self.ui.deleteDatabase();
			})
			dbc.appendChild(dbut);
		}
		if(this.ui.showControl("woql_select")){
			var qbut = document.createElement("button");
			qbut.setAttribute("class", "terminus-control-button terminus-query-button");
			qbut.appendChild(document.createTextNode("Query"));
			qbut.addEventListener("click", function(){
				self.ui.showQueryPage();
			})
			dbc.appendChild(qbut);
		}
		if(this.ui.showControl("get_schema")){
			var scbut = document.createElement("button");
			scbut.setAttribute("class", "terminus-control-button terminus-schema-button");
			scbut.appendChild(document.createTextNode("Schema"));
			scbut.addEventListener("click", function(){
				self.ui.showSchemaPage();
			})
			dbc.appendChild(scbut);
		}
		var docdom = document.createElement("div");
		docdom.setAttribute("class", "terminus-document-control");
		if(this.ui.showControl("get_document")){
			docdom.appendChild(this.getDocumentChooserDOM());
		}
		if(this.ui.showControl("create_document")){
			docdom.appendChild(this.getDocumentCreatorDOM());
		}
		dbc.appendChild(docdom);
	}
	return dbc;
}

TerminusDBController.prototype.getDocumentChooserDOM = function(){
	var self = this;
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-document-chooser");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label");
	lab.appendChild(document.createTextNode("ID "));
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-chooser");
	dcip.setAttribute("placeholder", "Enter Document ID");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button")
	nbut.appendChild(document.createTextNode("View Document"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.ui.showDocument(dcip.value);
	})
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-chooser-buttons");
	nbuts.appendChild(nbut);
	scd.appendChild(lab);
	scd.appendChild(dcip);
	scd.appendChild(nbuts);
	return scd;
};

TerminusDBController.prototype.getDocumentCreatorDOM = function(){
	var self = this;
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-document-creator");
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-creator");
	dcip.setAttribute("placeholder", "Enter Document Type");
	var nbut = document.createElement("button");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-creator-label");
	lab.appendChild(document.createTextNode("Type "));
	nbut.setAttribute('class', "terminus-control-button create-document-button")
	nbut.appendChild(document.createTextNode("Create Document"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.ui.showCreateDocument(dcip.value);
	})
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-creator-buttons");
	//nbuts.appendChild(nbut);
	//scd.appendChild(lab);
	//scd.appendChild(dcip);
	//scd.appendChild(nbuts);
	var wq = new WOQLQuery(this.ui.client, {});
	//var filter = wq.getSubclassQueryPattern("Class", "dcog/'Document'") + ", not(" + wq.getAbstractQueryPattern("Class") + ")";
	var filter = "not(" + wq.getAbstractQueryPattern("Class") + ")";
	
	var termcc = new TerminusClassChooser(this.ui, filter);
	termcc.empty_choice = "Create Document of Type";
	termcc.change = function(new_class){
		if(new_class){
			self.ui.showCreateDocument(new_class);
			termcc.choice = false;
		}
	}
	var tcdom = termcc.getAsDOM();
	var nlab = document.createElement("a");
	nlab.setAttribute("href", "#");
	nlab.setAttribute("class", "document-which-chooser");
	nlab.appendChild(document.createTextNode("Text Input"));
	var nlabs = document.createElement("div");
	nlabs.appendChild(nlab);
	scd.appendChild(nlabs);
	var ccDOM = document.createElement("span");
	ccDOM.setAttribute("class", "create-document-list");
	ccDOM.appendChild(tcdom);
	scd.appendChild(ccDOM);
	var which = "select";
	nlab.addEventListener("click", function(){
		FrameHelper.removeChildren(scd);
		scd.appendChild(nlabs);
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
	});
	return scd;
};


function TerminusDBViewer(ui){
	this.ui = ui;
}

TerminusDBViewer.prototype.getAsDOM = function(selected){
	var pd = document.createElement("span");
	pd.setAttribute("class", "terminus-db-home-page");
	pd.appendChild(document.createTextNode("DB Home Page - "));
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-db-details");
	var scl = document.createElement("span");
	scl.setAttribute("class", "terminus-db-details-label");
	scl.appendChild(document.createTextNode("Connected to Database "))
	var scs = document.createElement("span");
	scs.setAttribute("class", "terminus-db-details-value");
	var dbrec = this.ui.getDBRecord();
	if(dbrec){
		var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.db);
		scs.appendChild(document.createTextNode(nm));
	}
	scd.appendChild(scl);
	scd.appendChild(scs);
	pd.appendChild(scd);
	return pd;
}


function TerminusDBCreator(ui){
	this.ui = ui;
}

TerminusDBCreator.prototype.getAsDOM = function(selected){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-db-creator");
	var sct = document.createElement("h2");
	sct.setAttribute("class", "terminus-db-creator-title");
	sct.appendChild(document.createTextNode("Create New Database"));
	scd.appendChild(sct);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-id-label terminus-form-label");
	slab.appendChild(document.createTextNode("ID"));
	sci.appendChild(slab);
	var idip = document.createElement("input");
	idip.setAttribute("type", "text");
	idip.setAttribute("class", "terminus-form-value");
	idip.setAttribute("placeholder", "No spaces or special characters allowed in IDs");
	sci.appendChild(idip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-title-label terminus-form-label");
	slab.appendChild(document.createTextNode("Title"));
	var titip = document.createElement("input");
	titip.setAttribute("type", "text");
	titip.setAttribute("placeholder", "A brief title for the Database");
	titip.setAttribute("class", "terminus-form-value");
	sci.appendChild(slab);
	sci.appendChild(titip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-title-label terminus-form-label");
	slab.appendChild(document.createTextNode("Description"));
	sci.appendChild(slab);
	var descip = document.createElement("textarea");
	descip.setAttribute("class", "terminus-textarea terminus-db-description");
	descip.setAttribute("placeholder", "A short text describing the database and its purpose");
	sci.appendChild(descip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-schema-label terminus-form-label");
	slab.appendChild(document.createTextNode("Import Schema"));
	sci.appendChild(slab);
	var schem = document.createElement("input");
	schem.setAttribute("placeholder", "Terminus DB URL");
	schem.setAttribute("type", "text");
	schem.setAttribute("class", "terminus-form-value terminus-form-url");

	sci.appendChild(schem);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "terminus-form-field");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-data-label terminus-form-label");
	slab.appendChild(document.createTextNode("Import Data"));
	sci.appendChild(slab);
	var datip = document.createElement("input");
	datip.setAttribute("type", "text");
	datip.setAttribute("placeholder", "Terminus DB URL");
	datip.setAttribute("class", "terminus-form-value terminus-form-url");
	sci.appendChild(datip);
	scd.appendChild(sci);
	var butfield = document.createElement("div");
	butfield.setAttribute("class", "terminus-control-buttons");
	var cancbut = document.createElement("button");
	cancbut.setAttribute("class", "terminus-control-button terminus-cancel-db-button");
	cancbut.appendChild(document.createTextNode("Cancel"));
	var loadbut = document.createElement("button");
	loadbut.setAttribute("class", "terminus-control-button terminus-create-db-button");
	loadbut.appendChild(document.createTextNode("Create"));
	var self = this;
	var gatherips = function(){
		var input = {};
		input.id = idip.value;
		input.title = titip.value;
		input.description = descip.value;
		input.schema = schem.value;
		input.data = datip.value;
		return input;
	}
	var self = this;
	loadbut.addEventListener("click", function(){
		var input = gatherips();
		self.ui.createDatabase(input);
	})
	cancbut.addEventListener("click", function(){
		self.ui.showServerMainPage();
	})
	butfield.appendChild(cancbut);
	butfield.appendChild(loadbut);
	scd.appendChild(butfield);
	return scd;
}

