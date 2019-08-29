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
		lab.setAttribute("class", "terminus-label terminus-db-label terminus-control-panel-label");
		lab.appendChild(document.createTextNode("DB "));
		var val = document.createElement("span");
		val.setAttribute("class", "terminus-value terminus-db-value terminus-control-panel-value");
		var dbrec = this.ui.client.getDBRecord();
		var nm = (dbrec && dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
		val.appendChild(document.createTextNode(nm));
		scd.appendChild(lab);
		scd.appendChild(val);
		dbc.appendChild(scd);
		var nav = document.createElement('div');
		nav.setAttribute('class', 'span3');
		dbc.appendChild(nav);
		var ul = document.createElement('ul');
		ul.setAttribute('class',' terminus-widget-menu' );
		nav.appendChild(ul);
		if(this.ui.showControl("db")){
	        var li = document.createElement('li');
	        li.setAttribute("class", "terminus-control-button terminus-change-server-button active terminus-pointer")
	        var self = this;
	        li.addEventListener("click", function(){
	            self.ui.showDBMainPage();
	        })
	        ul.appendChild(li);
	        var a = document.createElement('a');
	        var icon = document.createElement('i');
	        icon.setAttribute('class', 'terminus-menu-icon fa fa-home');
	        a.appendChild(icon);
	        var txt = document.createTextNode('Database Home');
	        a.appendChild(txt);
	        li.appendChild(a);
	        var icon = document.createElement('i');
		}
		if(this.ui.showControl("delete_database")){
			var li = document.createElement('li');
	        li.setAttribute("class", "terminus-control-button terminus-change-server-button active terminus-pointer")
	        var self = this;
	        li.addEventListener("click", function(){
	          self.ui.deleteDatabase();
	        })
	        ul.appendChild(li);
	        var a = document.createElement('a');
	        var icon = document.createElement('i');
	        icon.setAttribute('class', 'terminus-menu-icon fa fa-trash-alt');
	        a.appendChild(icon);
	        var txt = document.createTextNode('Delete Database');
	        a.appendChild(txt);
	        li.appendChild(a);
	        var icon = document.createElement('i');
		}
		if(this.ui.showControl("woql_select")){
			var li = document.createElement('li');
  	        li.setAttribute("class", "terminus-control-button terminus-change-server-button active terminus-pointer")
  	        var self = this;
	        li.addEventListener("click", function(){
	            self.ui.showQueryPage();
	        })
	        ul.appendChild(li);
	        var a = document.createElement('a');
	        var icon = document.createElement('i');
	        icon.setAttribute('class', 'terminus-menu-icon fa fa-search');
	        a.appendChild(icon);
	        var txt = document.createTextNode('Query');
	        a.appendChild(txt);
	        li.appendChild(a);
	        var icon = document.createElement('i');
		}
		if(this.ui.showControl("get_schema")){
			var li = document.createElement('li');
	        li.setAttribute("class", "terminus-control-button terminus-change-server-button active terminus-pointer")
	        var self = this;
	        li.addEventListener("click", function(){
	            self.ui.showSchemaPage();
	        })
	        ul.appendChild(li);
  	        var a = document.createElement('a');
	        var icon = document.createElement('i');
	        icon.setAttribute('class', 'terminus-menu-icon fa fa-cog');
	        a.appendChild(icon);
	        var txt = document.createTextNode('Schema');
	        a.appendChild(txt);
	        li.appendChild(a);
	        var icon = document.createElement('i');
		}
		var li = document.createElement('li');
		li.setAttribute("class", "terminus-control-button terminus-change-server-button terminus-doc-li active terminus-pointer");
		ul.appendChild(li);
		var a = document.createElement('a');
		var icon = document.createElement('i');
		icon.setAttribute('class', 'terminus-menu-icon fa fa-file');
		a.appendChild(icon);
		var txt = document.createTextNode('Documents');
		a.appendChild(txt);
		li.appendChild(a);
		var icon = document.createElement('i');
		if(this.ui.showControl("get_document")){
			li.appendChild(this.getDocumentChooserDOM());
		}
		if(this.ui.showControl("create_document")){
			li.appendChild(this.getDocumentCreatorDOM());
		}
	}
	return dbc;
}

TerminusDBController.prototype.getDocumentChooserDOM = function(){
	var self = this;
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-document-chooser terminus-form-horizontal terminus-control-group");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label terminus-control-label terminus-control-label-padding");
	lab.appendChild(document.createTextNode("ID "));
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document ID");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button terminus-doc-btn")
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
	scd.setAttribute("class", "terminus-document-creator terminus-form-horizontal terminus-control-group");
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-creator terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document Type");
	var nbut = document.createElement("button");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-creator-label terminus-control-label terminus-control-label-padding");
	lab.appendChild(document.createTextNode("Type "));
	nbut.setAttribute('class', "terminus-control-button create-document-button terminus-doc-btn")
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
	var filter = wq.getSubclassQueryPattern("Class", "dcog/'Document'") + ", not(" + wq.getAbstractQueryPattern("Class") + ")";
	//var filter = "not(" + wq.getAbstractQueryPattern("Class") + ")";

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
	nlab.setAttribute("class", "document-which-chooser document-chooser-a");
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
	this.wquery = new WOQLQuery(ui.client, this.options);
}

TerminusDBViewer.prototype.getAsDOM = function(selected){
	var pd = document.createElement("span");
	pd.setAttribute("class", "terminus-db-home-page");
	var dhp = document.createElement("span");
	dhp.setAttribute('class', 'terminus-home-heading');
	dhp.appendChild(document.createTextNode("DB Home Page - "));
	pd.appendChild(dhp);
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-db-details");
	var scs = document.createElement("span");
	scs.setAttribute("class", "terminus-db-details-value ");
	var dbrec = this.ui.getDBRecord();
	if(dbrec){
		var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.db);
		scs.appendChild(document.createTextNode(nm));
		scs.setAttribute('class', 'terminus-home-heading');
	}
	scd.appendChild(scs);
	pd.appendChild(scd);
	pd.appendChild(prettifyHeaderDom('Summary'));
	this.getDBSummary(pd);
	pd.appendChild(pd.appendChild(prettifyHeaderDom('List of Classes')));
	this.getClassesDOM(pd);
	return pd;
}

TerminusDBViewer.prototype.getDbInfoBox = function(r, module){
	var sp = document.createElement('span');
    sp.setAttribute('class', 'terminus-db-info-box');

    var a = document.createElement('a');
    a.setAttribute('style', 'font-size: large;')
    var i = document.createElement('i');
	a.appendChild(i);
    var b = document.createElement('b');
    b.setAttribute('class', 'terminus-info-heading');
	switch(module){
		case 'size':
			i.setAttribute('class', 'terminus-menu-icon fa fa-balance-scale');
			b.innerHTML = 'Size';
		    var txt = document.createTextNode('2 Gb');
		break;
		case 'created':
			i.setAttribute('class', 'terminus-menu-icon fa fa-calendar');
			b.innerHTML = 'Created';
		    var txt = document.createTextNode('16 July 2015');
		break;
		case 'modified':
			i.setAttribute('class', 'terminus-menu-icon fa fa-clock');
			b.innerHTML = 'Last Modified';
		    var txt = document.createTextNode('22 Dec 2019');
		break;
	}
    a.appendChild(b);
	var br = document.createElement('BR');
    a.appendChild(br);
    if(txt) a.appendChild(txt);
    sp.appendChild(a);
    r.appendChild(sp);
}

TerminusDBViewer.prototype.getDBSummary = function(d){
	// delete database
    var del = document.createElement('button');
    del.setAttribute('class', 'terminus-del-btn');
    del.setAttribute('type', 'button');
    del.innerHTML = 'Delete';
	var dbrec = this.ui.getDBRecord();
	if(dbrec)
		var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.db);
    var self = this;
    del.addEventListener("click", function(){
      self.ui.deleteDatabase(nm);
    });
    d.appendChild(del);

    var r = document.createElement('span');
    r.setAttribute('class', 'terminus-db-info-box-display');
    d.appendChild(r);

    /* temporary - can change according to further requirments */
    this.getDbInfoBox(r, 'size');
    this.getDbInfoBox(r, 'created');
    this.getDbInfoBox(r, 'modified');
}

TerminusDBViewer.prototype.getClassesDOM = function(d){
	var q = this.wquery.getEntityClassQuery();
	var self = this;
	this.wquery.execute(q)
	.then(function(result){
		if(true || !self.result){
			self.result = new WOQLResultsViewer(result, {});
		}
		else {
			//self.result.newResult(result);
		}
		var nd = self.result.getAsDOM();
		if(nd){
			nd.setAttribute('class', 'terminus-margin-box');
			d.appendChild(nd);
		}
	})
	.catch(function(err){
		console.error(err);
		self.ui.showError(err);
	});
	return d;
}


function TerminusDBCreator(ui){
	this.ui = ui;
}

TerminusDBCreator.prototype.getAsDOM = function(selected){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-db-creator");
	var sct = document.createElement("h3");
	sct.setAttribute("class", "terminus-db-creator-title terminus-module-head");
	sct.appendChild(document.createTextNode("Create New Database"));
	scd.appendChild(sct);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-id-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("ID"));
	sci.appendChild(slab);
	var idip = document.createElement("input");
	idip.setAttribute("type", "text");
	idip.setAttribute("class", "terminus-form-value terminus-input-text");
	idip.setAttribute("placeholder", "No spaces or special characters allowed in IDs");
	sci.appendChild(idip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-title-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Title"));
	var titip = document.createElement("input");
	titip.setAttribute("type", "text");
	titip.setAttribute("placeholder", "A brief title for the Database");
	titip.setAttribute("class", "terminus-form-value terminus-input-text");
	sci.appendChild(slab);
	sci.appendChild(titip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-title-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Description"));
	sci.appendChild(slab);
	var descip = document.createElement("textarea");
	descip.setAttribute("class", "terminus-textarea terminus-db-description terminus-textarea ");
	descip.setAttribute("placeholder", "A short text describing the database and its purpose");
	sci.appendChild(descip);
	scd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-schema-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Import Schema"));
	sci.appendChild(slab);
	var schem = document.createElement("input");
	schem.setAttribute("placeholder", "Terminus DB URL");
	schem.setAttribute("type", "text");
	schem.setAttribute("class", "terminus-form-value terminus-form-url terminus-input-text");

	sci.appendChild(schem);
	scd.appendChild(sci);
	var sci = document.createElement("span");
	sci.setAttribute("class", "terminus-form-field terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-data-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Import Data"));
	sci.appendChild(slab);
	var datip = document.createElement("input");
	datip.setAttribute("type", "text");
	datip.setAttribute("placeholder", "Terminus DB URL");
	datip.setAttribute("class", "terminus-form-value terminus-form-url terminus-input-text");
	sci.appendChild(datip);
	scd.appendChild(sci);
	var butfield = document.createElement("div");
	butfield.setAttribute("class", "terminus-control-buttons");
	var cancbut = document.createElement("button");
	cancbut.setAttribute("class", "terminus-control-button terminus-cancel-db-button terminus-btn");
	cancbut.appendChild(document.createTextNode("Cancel"));
	var loadbut = document.createElement("button");
	loadbut.setAttribute("class", "terminus-control-button terminus-create-db-button terminus-btn");
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
