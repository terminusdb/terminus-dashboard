/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
const WOQLResultsViewer = require('../query/WOQLResultsViewer');
const TerminusClassChooser = require('./TerminusClassChooser');
const TerminusDocumentChooser = require('./TerminusDocumentChooser');
const WOQLQuery=require('../query/WOQLQuery');
const UTILS=require('../Utils');

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
		// connected to db
		var a = document.createElement('a');
        a.setAttribute('class', 'terminus-dashboard-info terminus-list-group-a terminus-nav-width');
        var txt = 'Database: ' + nm;
        a.appendChild(document.createTextNode(txt));
        ul.appendChild(a);
		if(this.ui.showControl("db")){
			var item = this.getControlHTML("Database Home", "fa-home");
			item.classList.add("terminus-selected");
		    item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.showDBMainPage();
			 });
	        ul.appendChild(item);
	    }
		if(this.ui.showControl("delete_database")){
			var item = this.getControlHTML("Delete Database", "fa-trash-alt");
		    item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.deleteDatabase();
			 });
	        ul.appendChild(item);
		}
		if(this.ui.showControl("woql_select")){
			var item = this.getControlHTML("Query", "fa-search");
		    item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.showQueryPage();
			});
	        ul.appendChild(item);
		}
		if(this.ui.showControl("woql_update")){
			var item = this.getControlHTML("Mapping", "fa-file-import");
	        item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.showMappingPage();
			})
	        ul.appendChild(item);
		}
		if(this.ui.showControl("get_schema")){
			var item = this.getControlHTML("Schema", "fa-cog");
	        item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.showSchemaPage();
			})
	        ul.appendChild(item);
		}
		if((this.ui.showControl("get_document") || this.ui.showControl("create_document"))){
			var item = this.getControlHTML("Document", "fa-book");
	        item.addEventListener("click", function(){
				UTILS.removeSelectedNavClass("terminus-selected");
                this.classList.add("terminus-selected");
				self.displayDocumentSubMenus();
			})
	        ul.appendChild(item);
		}
		// hidden submenus
		if(this.ui.showControl("get_document")) {
			var a = document.createElement('a');
			a.setAttribute('class', 'terminus-hide terminus-get-doc');
			a.appendChild(self.getDocumentChooserDOM());
			a.classList.add();
			ul.appendChild(a);
		}
		// hidden submenus
		if(this.ui.showControl("create_document")) {
			var a = document.createElement('a');
			a.setAttribute('class', 'terminus-hide terminus-create-doc');
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

TerminusDBController.prototype.showSubMenus = function(el){
	el.classList.remove('terminus-hide');
	el.classList.add('terminus-display');
}

TerminusDBController.prototype.displayDocumentSubMenus = function(){
	//display submenus on click of documents
	if(this.ui.showControl("get_document")) {
		var gd = document.getElementsByClassName('terminus-get-doc');
		this.showSubMenus(gd[0]);
	}
	if(this.ui.showControl("create_document")) {
		var cd = document.getElementsByClassName('terminus-create-doc');
		this.showSubMenus(cd[0]);
	}
}


TerminusDBController.prototype.getDocumentChooserDOM = function(){
	var self = this;
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-document-chooser terminus-form-horizontal terminus-control-group terminus-choose-by-id");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label terminus-control-label terminus-control-label-padding");
	//lab.appendChild(document.createTextNode("ID "));
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-doc-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document ID");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button terminus-doc-btn")
	nbut.appendChild(document.createTextNode("View"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.ui.showDocument(dcip.value);
	})
	if(this.ui.client.connectionConfig.platformEndpoint() && this.ui.pluginAvailable("select2")){

		var mcls = TerminusClient.FrameHelper.unshorten("tcs:Document");
		var d2ch = new TerminusDocumentChooser(this.ui, mcls);
		d2ch.change = function(val){
			self.ui.showDocument(val);
		}
		d2ch.view = "label";
		var sdom = d2ch.getAsDOM('terminus-class-select');
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
	var nbuts = document.createElement("span");
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
	scd.setAttribute("class", "terminus-document-creator terminus-form-horizontal terminus-control-group terminus-choose-by-id");

	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-doc-value terminus-document-creator terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document Type");
	var nbut = document.createElement("button");
	var lab = document.createElement("span");
	lab.setAttribute("class", "document-creator-label terminus-control-label terminus-control-label-padding");
	//lab.appendChild(document.createTextNode("Type "));
	nbut.setAttribute('class', "terminus-control-button create-document-button terminus-doc-btn")
	nbut.appendChild(document.createTextNode("Create"));
	nbut.addEventListener("click", function(){
		if(dcip.value) self.ui.showCreateDocument(dcip.value);
	})
	var nbuts = document.createElement("div");
	nbuts.setAttribute("class", "terminus-control-buttons terminus-document-creator-buttons");
	var wq = new WOQLQuery(this.ui.client, {}, this.ui);
	var filter = wq.getConcreteDocumentClassPattern("v:Element");
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
	bi.setAttribute('class', 'terminus-doc-btn-selected terminus-doc-toggle-btn');
	bi.appendChild((document.createTextNode('D')));
	var tds = document.createElement('span');
	tds.setAttribute('class', 'terminus-tooltiptext');
	tds.appendChild(document.createTextNode('Dropdown List'));
	bi.appendChild(tds);
	var bt = document.createElement('button');
	bt.setAttribute('class', 'terminus-doc-toggle-btn');
	bt.appendChild((document.createTextNode('T')));
	var tts = document.createElement('span');
	tts.setAttribute('class', 'terminus-tooltiptext');
	tts.appendChild(document.createTextNode('Text Input'));
	bt.appendChild(tts);
	gb.appendChild(bt);
	gb.appendChild(bi);
	var nlabs = document.createElement("div");
	nlabs.setAttribute('class', 'terminus-doc-btn-gp-align');
	nlabs.appendChild(gb);
	scd.appendChild(nlabs);
	var ccDOM = document.createElement("span");
	nlabs.appendChild(ccDOM);
	ccDOM.setAttribute("class", "create-document-list");
	ccDOM.appendChild(tcdom);
	var which = "select";
	bt.addEventListener("click", function(){
		// create document of TerminusClient.FrameHelper.removeChildren(nlabs);
		TerminusClient.FrameHelper.removeChildren(ccDOM);
		UTILS.removeSelectedNavClass("terminus-doc-btn-selected");
		this.classList.add("terminus-doc-btn-selected");
		ccDOM.appendChild(dcip);
		ccDOM.appendChild(nbut);
	});

	bi.addEventListener("click", function(){
		// create document from dropdown
		TerminusClient.FrameHelper.removeChildren(ccDOM);
		UTILS.removeSelectedNavClass("terminus-doc-btn-selected");
		this.classList.add("terminus-doc-btn-selected");
		ccDOM.appendChild(tcdom);
	});
	return scd;
};

function TerminusDBViewer(ui){
	this.ui = ui;
	this.wquery = new WOQLQuery(ui.client, this.options, ui);
}

TerminusDBViewer.prototype.getAsDOM = function(selected){
	var pd = document.createElement("span");
	pd.setAttribute("class", "terminus-db-home-page");
	var sth = document.createElement('div');
	var banner = document.createElement('div');
	//pd.appendChild(banner);
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
	//pd.appendChild(UTILS.getHeaderDom('Summary'));
	this.getDeleteOnHomePage(pd);
	//this.getDBSummary(pd);
	pd.appendChild(pd.appendChild(UTILS.getHeaderDom('List of Documents')));
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

TerminusDBViewer.prototype.getDeleteOnHomePage = function(d){
	// delete database
	if(this.ui.db() == "terminus") return;
    var del = document.createElement('button');
    del.setAttribute('class', 'terminus-btn terminus-btn-float-right terminus-home-del');
    del.setAttribute('type', 'button');
    del.innerHTML = 'Delete Database';
	var dbrec = this.ui.getDBRecord();
	if(dbrec)
		var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
    var self = this;
    var dbdel = this.ui.db();

    del.addEventListener("click", function(){
      	var deleteConfirm = confirm(`Do you want to delete ${dbdel} Database?`);
		if (deleteConfirm == true) {
			self.ui.deleteDatabase(dbdel);
		}
    });
    d.appendChild(del);
}

TerminusDBViewer.prototype.getDBSummary = function(d){
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
		self.result = new WOQLResultsViewer.WOQLResultsViewer(self.ui, result, self.wquery, {}, {}, false);
		if(self.result){
			var nd = self.result.getAsDOM(d, false);
			if(nd){
				nd.setAttribute('class', 'terminus-margin-box');
	        }
			else{
				nor = document.createElement('div');
				nor.setAttribute('class', 'terminus-no-res-alert');
				nor.appendChild(document.createTextNode("No results available, create new ones to view them here..."));
				d.appendChild(nor);
			}
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
	/* test delete when over var txtHolder = document.createElement("div");
	txtHolder.appendChild(document.createTextNode('expecting laoder herer'));
	scd.appendChild(txtHolder);
	this.ui.getLoader(scd);*/
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
	//mfd.appendChild(sci);
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
module.exports={TerminusDBViewer:TerminusDBViewer,
	            TerminusDBController:TerminusDBController,
	            TerminusDBCreator:TerminusDBCreator}
