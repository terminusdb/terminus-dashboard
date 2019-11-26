/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
const WOQLResultsViewer = require('./client/WOQLResultsViewer');
const TerminusClassChooser = require('./client/TerminusClassChooser');
const TerminusDocumentChooser = require('./client/TerminusDocumentChooser');
const WOQLQuery=require('./client/WOQLQuery');
const UTILS=require('./Utils');
const TerminusClient = require('@terminusdb/terminus-client');
const TerminusHTMLViewer = require("./TerminusHTMLViewer");

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
			item.classList.add('terminus-document-nav');
	        item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.showDocumentPage();
				//UTILS.removeSelectedNavClass("terminus-selected");
                //this.classList.add("terminus-selected");
				//UTILS.displayDocumentSubMenus(self.ui);
			})
	        ul.appendChild(item);
		}
		// hidden submenus
		/*if(this.ui.showControl("get_document")) {
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
		} */
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
	var lod = document.createElement('div');
	lod.setAttribute('class', 'terminus-list-of-doc');
	lod.appendChild(UTILS.getHeaderDom('List of Documents'))
	pd.appendChild(lod);
	let query = TerminusClient.WOQL.limit(25).start(0).getEverything();
	let test = query.prettyPrint();
	pd.appendChild(document.createTextNode(JSON.stringify(test)));
	//this.getClassesDOM(pd); // un comment this later on ...
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

TerminusDBViewer.prototype.getDocumentTableConfig = function(nq){
	var self = this;
	var rowClick = function(row){
		self.ui.showDocument(row['v:ID']);
	};
	var cellClick = function(key, value){
		self.ui.showDocument(value);
	}

	var opts = {
		//cellClick: cellClick,
		rowClick: rowClick,
		"v:ID": {
			hidden: true
		},
		"v:Class": {hidden: true },
		"v:Type_Comment": {hidden: true },
		"v:Label": {
			header: "Document",
			renderer: function(dataviewer){
				return dataviewer.annotateValue(dataviewer.value(),
					{ ID: dataviewer.binding('v:ID')});
			},
		},
		"v:Type": {
			renderer: function(dataviewer){
				return dataviewer.annotateValue(dataviewer.value(),
						{ Class: dataviewer.binding('v:Class'), Description: dataviewer.binding('v:Type_Comment')}
				);
			}
		},
		"v:Comment": {	header: "Description", renderer: "HTMLStringViewer", args: {max_cell_size: 40, max_word_size: 10} },
		"column_order" : ["v:Label", "v:Type", "v:Comment"]
	}
	//return {};
	return opts;
}



TerminusDBViewer.prototype.getClassesDOM = function(d){
	/*var q = TerminusClient.WOQL
				.limit(25)
				.start(0)
				.documentMetadata();*/
	var self = this;
	var rowClick = function(row){
		self.ui.showDocument(row['v:ID']);
	};
	var cellClick = function(key, value){
		self.ui.showDocument(value);
	}

	var showLabel = function(value, key, row){
		if(value) return document.createTextNode(value['@value'] + " aa");
		return document.createElement("span");
	}
	let nq = new TerminusHTMLViewer(this.ui.client);//should specify default renderers here....
	let WOQL = TerminusClient.WOQL;
	let query = WOQL.from(this.ui.client.connectionConfig.dbURL()).limit(25).start(0).documentMetadata();
	//TerminusClient.FrameHelper.loadDynamicCSS("myfa", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0-11/css/all.css");
	query.execute(this.ui.client).then((results) => {
		/*let qres = new TerminusClient.WOQLResult(results, query);
		var nt = nq.showResult(qres, WOQL.table());
		d.appendChild(nt);
		qres.first()
		var n = nq.showResult(qres, WOQL.chooser());
		d.appendChild(n);
		qres.first();
		var lg = WOQL.graph();
		lg.source("v:Subject");
		var licon2 = { color: [255,255,25], weight: 100, unicode: "\uf2bb", size:2 };
		lg.edge("v:Subject", "v:Object").icon(licon2);
		var ng = nq.showResult(qres, lg);
		d.appendChild(ng);
		qres.first();
		//var sg = nq.showResult(qres, WOQL.stream());
		//d.appendChild(sg);
		//d.appendChild(nc);
		//var ng = nq.displayResults(false, WOQL.graph());
		//d.appendChild(ng);
		let t = WOQL.table().pager(false);
		t.column("Class", "Type_Comment", "ID").hidden(true);
		t.column("Label").header("Document");
		t.column("Comment").header("Description");
		t.column("Comment").renderer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});
		//t.column_order("Subject", "Predicate", "Object");
		t.column("Label").render(showLabel);
		t.row().click(rowClick);
		qres.first();
		var dt2 = nq.showResult(qres, t);
		d.appendChild(dt2);

		qres.first();
		var w = WOQL.chooser().values("ID").labels("Comment").titles("Class").sort("Comment").direction("asc");
		w.change(function(x){
			alert(x);
		}).show_empty("Choose something");
		var n2 = nq.showResult(qres, w);
		d.appendChild(n2);
		var licon2 = { color: [255,255,25], weight: 100, unicode: "\uf2bb", size:2 };
		var licon = { color: [255,255,255], weight: 100, unicode: "\uf1c2"};
		var licon3 = { color: [23,3,34], weight: 100, unicode: "\uf1c2"};
		var lborder = { color: [10,255,0], weight: 100, unicode: "\uf2bb", size:2 };
		var g = WOQL.graph();
		g.source("ID").width("1000").height(1000);//.literals(false);
		//g.node("Id").size(20).color([220, 202, 230]).collisionRadius(100).icon(licon3);
		g.node("Object").size(24).color([20, 20, 20]).icon(licon2);
		g.node().literal(true).color([200, 200, 220]).size(10).icon(licon);
		g.node("Predicate").hidden(true);
		//var e = g.rule().edge("ID", "Class").label(x).icon(y).color();
		//var n = g.rule().node("ID").label(x).icon(y).color();
		g.edges(["Subject", "Object"]);
		g.edge().color([150, 200, 250]);
		qres.first()
		var ng3 = nq.showResult(qres, g);
		d.appendChild(ng3);*/
		var x = "doc:access_all_areas";
		var nd = WOQL.document();
		nd.show_all("SimpleFrameViewer");
		nd.object().features("id", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "viewer", "status",
		nd.property().features("value");//features("id", "cardinality", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "status",
		nd.data().features("value");//.dataviewer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});
		var d1 = nq.document(x, nd);
		d.appendChild(d1);
	});
	//let c = WOQL.chooser();

	//t.display(query);
	//t.column("Label").header("Document").render(showLabel).click(cellClick);
	//t.column("ID").header("l").renderer("MyRenderer");
	//should specify default renderers here....
	//var qp = nq.querypane(woql, this.getDocumentTableConfig());

	//let nquery = WOQL.from(this.ui.client.connectionConfig.dbURL()).limit(1000).simpleGraphQuery();
	//let g = WOQL.graph();
	//g.edge("v:Source", "v:Edge", "v:Target").label("bla").color([23,23,45]).weight("v:Account")
	//t.column("Class", "Type_Comment", "ID").hidden(true);
	//t.column("Label").header("Document").render(showLabel).click(cellClick);
	//t.column("Comment").header("Description").renderer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});
	//t.column("ID").header("l").renderer("MyRenderer");
	//t.order("Label", "Type", "Comment");
	//var ng = nq.displayResults(nquery, g);
	//d.appendChild(ng);


	return d;
	/*var q = this.wquery.getClassesQuery(25, 0);
	var self = this;
	//this.wquery.execute(q)
	q.execute(this.ui.client)
	.then(function(result){
		var wqRes = new TerminusClient.WOQLResult(result, q);
		self.result = new WOQLResultsViewer.WOQLResultsViewer(self.ui, result, wqRes, {}, {}, false);
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
	return d;*/
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
	slab.setAttribute("class", "terminus-schema-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("Key"));
	sci.appendChild(slab);
	var kip = document.createElement("input");
	kip.setAttribute("placeholder", "Server API Key");
	kip.setAttribute("type", "text");
	kip.setAttribute("class", "terminus-form-value terminus-form-url terminus-input-text");
	sci.appendChild(kip);
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
		input.key = kip.value;
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
