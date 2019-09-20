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
		var dbrec = this.ui.client.connection.getDBRecord();
		var nm = (dbrec && dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
		val.appendChild(document.createTextNode(nm));
		scd.appendChild(lab);
		scd.appendChild(val);
		//dbc.appendChild(scd);
		var nav = document.createElement('div');
		nav.setAttribute('class', 'span3');
		dbc.appendChild(nav);
		var ul = document.createElement('ul');
		ul.setAttribute('class','terminus-ul' );
		nav.appendChild(ul);
		if(this.ui.showControl("db")){
			var item = this.getControlHTML("Database Home", "fa-home");
			item.classList.add("terminus-selected");
		    item.addEventListener("click", function(){
				removeSelectedNavClass("terminus-selected");
                this.classList.add("terminus-selected");
				self.ui.showDBMainPage();
			 });
	        ul.appendChild(item);
	    }
		if(this.ui.showControl("delete_database")){
			var item = this.getControlHTML("Delete Database", "fa-trash-alt");
		    item.addEventListener("click", function(){ self.ui.deleteDatabase(); });
	        ul.appendChild(item);
		}
		if(this.ui.showControl("woql_select")){
			var item = this.getControlHTML("Query", "fa-search");
		    item.addEventListener("click", function(){
				removeSelectedNavClass("terminus-selected");
                this.classList.add("terminus-selected");
				self.ui.showQueryPage();
			});
	        ul.appendChild(item);
		}
		if(this.ui.showControl("woql_update")){
			var item = this.getControlHTML("Mapping", "fa-file-import");
	        item.addEventListener("click", function(){
				removeSelectedNavClass("terminus-selected");
                this.classList.add("terminus-selected");
				self.ui.showMappingPage();
			})
	        ul.appendChild(item);
		}
		if(this.ui.showControl("get_schema")){
			var item = this.getControlHTML("Schema", "fa-cog");
	        item.addEventListener("click", function(){
				removeSelectedNavClass("terminus-selected");
                this.classList.add("terminus-selected");
				self.ui.showSchemaPage();
			})
	        ul.appendChild(item);
		}
		if((this.ui.showControl("get_document") || this.ui.showControl("create_document"))){
			var item = this.getControlHTML("Document", "fa-book");
	        item.addEventListener("click", function(){
				removeSelectedNavClass("terminus-selected");
                this.classList.add("terminus-selected");
				self.showDocumentSubMenus();
			})
	        ul.appendChild(item);
		}
		// hidden submenus
		if(this.ui.showControl("get_document")) {
			var a = document.createElement('a');
			a.setAttribute('class', 'terminus-nav-in-focus terminus-hide terminus-get-doc');
			a.appendChild(self.getDocumentChooserDOM());
			ul.appendChild(a);
		}
		// hidden submenus
		if(this.ui.showControl("create_document")) {
			var a = document.createElement('a');
			a.setAttribute('class', 'terminus-nav-in-focus terminus-hide terminus-create-doc');
			a.appendChild(self.getDocumentCreatorDOM());
			ul.appendChild(a);
		}
	}
	return dbc;
}


TerminusDBController.prototype.getControlHTML = function(text, ic, css){
    var self = this;
    var a = document.createElement('a');
	a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa ' + ic);
    a.appendChild(icon);
    var txt = document.createTextNode(text);
    a.appendChild(txt);
    return a;
}

TerminusDBController.prototype.showDocumentSubMenus = function(){
	//display submenus on click of documents
	if(this.ui.showControl("get_document")) {
		var gd = document.getElementsByClassName('terminus-get-doc');
		gd[0].classList.remove('terminus-hide');
		gd[0].classList.add('terminus-display');
	}
	if(this.ui.showControl("create_document")) {
		var cd = document.getElementsByClassName('terminus-create-doc');
		cd[0].classList.remove('terminus-hide');
		cd[0].classList.add('terminus-display');
	}
}

TerminusDBController.prototype.getDocumentChooserDOM = function(){
	var self = this;
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-document-chooser terminus-form-horizontal terminus-control-group terminus-choose-by-id");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label terminus-control-label terminus-control-label-padding");
	//lab.appendChild(document.createTextNode("ID "));
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document ID");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button terminus-doc-btn")
	nbut.appendChild(document.createTextNode("View Document"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.ui.showDocument(dcip.value);
	})
	if(this.ui.client.connectionConfig.platformEndpoint() && this.ui.pluginAvailable("select2")){
		var mcls = FrameHelper.unshorten("dcog:Document");
		var d2ch = new TerminusDocumentChooser(this.ui, mcls);
		d2ch.change = function(val){
			alert("changed to " + val);
			self.ui.showDocument(val);
		}
		d2ch.view = "label";
		var sdom = d2ch.getAsDOM('terminus-class-select');
		/*
		var showDoc = function(durl){
			self.ui.showDocument(durl);
		}
		var callback = showDoc;
		var searchurl = self.ui.client.dbURL() + "/search";
		var sdom = getS2EntityChooser(false, searchurl, this.ui.client, mcls, callback);*/
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
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-chooser-buttons");
	nbuts.appendChild(nbut);
	scd.appendChild(lab);
	scd.appendChild(dcip);
	scd.appendChild(nbuts);
	return scd;
};

TerminusDBController.prototype.getCreateDocumentOfTypeChooser = function(){
	var termcc = new TerminusClassChooser(this.ui, filter);
	termcc.empty_choice = "Create Document of Type";
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			self.ui.showCreateDocument(new_class);
			termcc.choice = false;
		}
	}
	return termcc.getAsDOM('terminus-class-select');
}

TerminusDBController.prototype.getDocumentCreatorDOM = function(){
	var self = this;
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-document-creator terminus-form-horizontal terminus-control-group terminus-choose-by-id");

	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-creator terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document Type");
	var nbut = document.createElement("button");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-creator-label terminus-control-label terminus-control-label-padding");
	//lab.appendChild(document.createTextNode("Type "));
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
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			self.ui.showCreateDocument(new_class);
			termcc.choice = false;
		}
	}
	var tcdom = termcc.getAsDOM('terminus-class-select');

	var gb = document.createElement('div');
	gb.setAttribute('class', 'terminus-doc-btn-group');
	var bi = document.createElement('button');
	bi.setAttribute('class', 'terminus-doc-btn-selected');
	bi.appendChild((document.createTextNode('D')));
	var bt = document.createElement('button');
	bt.appendChild((document.createTextNode('T')));
	gb.appendChild(bt);
	gb.appendChild(bi);





	/*var nlab = document.createElement("a");
	nlab.setAttribute("href", "#");
	nlab.setAttribute("class", "document-which-chooser document-chooser-a");
	nlab.appendChild(document.createTextNode("Text Input"));*/


	var nlabs = document.createElement("div");
	nlabs.setAttribute('class', 'terminus-doc-btn-gp-align');
	//nlabs.appendChild(nlab);
	nlabs.appendChild(gb);


	scd.appendChild(nlabs);
	var ccDOM = document.createElement("span");
	nlabs.appendChild(ccDOM);
	ccDOM.setAttribute("class", "create-document-list");
	ccDOM.appendChild(tcdom);

	var which = "select";

	bt.addEventListener("click", function(){
		// create document of FrameHelper.removeChildren(nlabs);
		FrameHelper.removeChildren(ccDOM);
		removeSelectedNavClass("terminus-doc-btn-selected");
		this.classList.add("terminus-doc-btn-selected");
		ccDOM.appendChild(dcip);
		ccDOM.appendChild(nbut);
	});

	bi.addEventListener("click", function(){
		// create document from dropdown
		FrameHelper.removeChildren(ccDOM);
		removeSelectedNavClass("terminus-doc-btn-selected");
		this.classList.add("terminus-doc-btn-selected");
		ccDOM.appendChild(tcdom);
	});
	/*nlab.addEventListener("click", function(){
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
	}); */
	return scd;
};


function TerminusDBViewer(ui){
	this.ui = ui;
	this.wquery = new WOQLQuery(ui.client, this.options);
}

TerminusDBViewer.prototype.getAsDOM = function(selected){
	var pd = document.createElement("span");
	pd.setAttribute("class", "terminus-db-home-page");
	var sth = document.createElement('div');
	var banner = document.createElement('div');
	pd.appendChild(banner);
	banner.setAttribute('class', 'terminus-banner');
	var dhp = document.createElement("span");
	dhp.setAttribute('class', 'terminus-home-heading');
	dhp.appendChild(document.createTextNode("DB Home Page - "));
	sth.appendChild(dhp);
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
	sth.appendChild(scd);
	banner.appendChild(sth);
	//pd.appendChild(sth);
	pd.appendChild(getHeaderDom('Summary'));
	this.getDBSummary(pd);
	pd.appendChild(pd.appendChild(getHeaderDom('List of Documents')));
	this.getClassesDOM(pd);
	return pd;
}

TerminusDBViewer.prototype.getDbInfoBox = function(r, module){
	var sp = document.createElement('span');
    sp.setAttribute('class', 'terminus-db-info-box');
	var info = document.createElement('div');
	info.appendChild(document.createTextNode(module.charAt(0).toUpperCase() + module.slice(1)));
	info.setAttribute('class', 'terminus-db-info');
	sp.appendChild(info);

    var i = document.createElement('i');
	switch(module){
		case 'size':
			i.setAttribute('class', 'terminus-icon fa fa-balance-scale');
		    var txt = document.createTextNode('2 Gb');
		break;
		case 'created':
			i.setAttribute('class', 'terminus-icon fa fa-calendar');
		    var txt = document.createTextNode('16 July 2015');
		break;
		case 'modified':
			i.setAttribute('class', 'terminus-icon fa fa-clock');
		    var txt = document.createTextNode('22 Dec 2019');
		break;
	}
    sp.appendChild(i);
	if(txt) sp.appendChild(txt);
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

    /* getDbInfoBox() calls can change according to further requirments */
    this.getDbInfoBox(r, 'size');
    this.getDbInfoBox(r, 'created');
    this.getDbInfoBox(r, 'modified');
}

TerminusDBViewer.prototype.getClassesDOM = function(d){
	var q = this.wquery.getClassesQuery();
	var self = this;
	this.wquery.execute(q)
	.then(function(result){
		if(true || !self.result){
			self.result = new WOQLResultsViewer(this.ui, result, {}, {});
		}
		else {
			//self.result.newResult(result);
		}
		if(self.result){
			var nd = self.result.getAsDOM();
			if(nd){
				nd.setAttribute('class', 'terminus-margin-box');
				d.appendChild(nd);
	        }
			else d.appendChild(document.createTextNode("No results returned"));
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
	var mfd = document.createElement('div');
	mfd.setAttribute('class', 'terminus-form-border');
	scd.appendChild(mfd);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-id-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("ID"));
	sci.appendChild(slab);
	var idip = document.createElement("input");
	idip.setAttribute("type", "text");
	idip.setAttribute("class", "terminus-form-value terminus-input-text");
	idip.setAttribute("placeholder", "No spaces or special characters allowed in IDs");
	sci.appendChild(idip);
	mfd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-title-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Title"));
	var titip = document.createElement("input");
	titip.setAttribute("type", "text");
	titip.setAttribute("placeholder", "A brief title for the Database");
	titip.setAttribute("class", "terminus-form-value terminus-input-text");
	sci.appendChild(slab);
	sci.appendChild(titip);
	mfd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-title-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Description"));
	sci.appendChild(slab);
	var descip = document.createElement("textarea");
	descip.setAttribute("class", "terminus-textarea terminus-db-description terminus-textarea ");
	descip.setAttribute("placeholder", "A short text describing the database and its purpose");
	sci.appendChild(descip);
	mfd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-schema-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Import Schema"));
	sci.appendChild(slab);
	var schem = document.createElement("input");
	schem.setAttribute("placeholder", "Terminus DB URL");
	schem.setAttribute("type", "text");
	schem.setAttribute("class", "terminus-form-value terminus-form-url terminus-input-text");

	sci.appendChild(schem);
	mfd.appendChild(sci);
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-data-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Import Data"));
	sci.appendChild(slab);
	var datip = document.createElement("input");
	datip.setAttribute("type", "text");
	datip.setAttribute("placeholder", "Terminus DB URL");
	datip.setAttribute("class", "terminus-form-value terminus-form-url terminus-input-text");
	sci.appendChild(datip);
	mfd.appendChild(sci);
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
	mfd.appendChild(butfield);
	return scd;
}
