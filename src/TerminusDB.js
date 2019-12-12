/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
const UTILS=require('./Utils');
const TerminusClient = require('@terminusdb/terminus-client');
const WOQLRule = require("./viewer/WOQLRule");
const QueryPane = require("./html/QueryPane");
const TerminusFrame = require("./viewer/TerminusFrame");
const DocumentPane = require("./html/DocumentPane");


/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
function TerminusDBController(ui){
	 this.ui = ui;
}

/*
 * Controller provides access to the server level functions (create/delete db) and db-level functions (schema, query, document)
 * Populates left hand column on dashboard page
 */
TerminusDBController.prototype.getAsDOM = function(){
	var self = this;
	var dbc = document.createElement("div");
	dbc.setAttribute("class", "terminus-db-controller");
	if(this.ui && this.ui.db()){
		var scd = document.createElement("div");
		scd.setAttribute("class", "terminus-field terminus-db-connection");
		var dbrec = this.ui.client.connection.getDBRecord();
		var nm = (dbrec && dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
		//dbc.appendChild(scd);
		var nav = document.createElement('div');
		nav.setAttribute('class', 'span3');
		dbc.appendChild(nav);
		var ul = document.createElement('ul');
		ul.setAttribute('class','terminus-ul' );
		nav.appendChild(ul);
		// connected to db
		var a = document.createElement('a');
        a.setAttribute('class', 'terminus-dashboard-info terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer"');
        a.appendChild(document.createTextNode(nm));
		ul.appendChild(a);
		var p = this.ui.page ? this.ui.page : "db";
		if(this.ui.showControl("db")){
			if(p == "db") a.classList.add("terminus-selected");		
			self.ui.page = "db";
			a.addEventListener("click", function(){
				self.ui.showDBMainPage();
				self.ui.page = "db";
				self.ui.redrawControls();
			});
		}
		
		if(this.ui.showControl("get_document")){
			var item = this.getControlHTML("Documents", "fas fa-file");
			if(p == "docs") item.classList.add("terminus-selected");
		    item.addEventListener("click", function(){
				self.ui.showDocumentPage();
				self.ui.page = "docs";
				self.ui.redrawControls();
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
			if(p == "query") item.classList.add("terminus-selected");
		    item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.page = "query";
				self.ui.showQueryPage();
				self.ui.redrawControls();
			});
	        ul.appendChild(item);
		}
		if(this.ui.showControl("get_schema")){
			var item = this.getControlHTML("Schema", "fa-cog");
			if(p == "schema") item.classList.add("terminus-selected");
	        item.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.page = "schema";
				self.ui.showSchemaPage();
				self.ui.redrawControls();
			})
	        ul.appendChild(item);
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


/**
 * DB home page main function
 * @param {TerminusUI} ui
 */
function TerminusDBViewer(ui){
	this.ui = ui;
	this.container = document.createElement("span");
	this.container.setAttribute("class", "terminus-main-page");
	this.pages = ["home"];
}

TerminusDBViewer.prototype.getAsDOM = function(){
	TerminusClient.FrameHelper.removeChildren(this.container);
	var limit = 20;
	var WOQL = TerminusClient.WOQL;
	var dburl = this.ui.client.connectionConfig.dbURL();
	var q = WOQL.from(dburl).limit(limit).documentMetadata();
	q.execute(this.ui.client).then( (result) => {
		var docs = new TerminusClient.WOQLResult(result, q);
		var q2 = WOQL.from(dburl).concreteDocumentClasses();
		q2.execute(this.ui.client).then( (result2) => {
			var docClasses = new TerminusClient.WOQLResult(result2, q2);
			var bdom = this.getBodyAsDOM(docs, docClasses);
			if(bdom) this.container.appendChild(bdom);
		});
	}).catch((e) => {
		this.ui.showError(e);
	});
	return this.container;
}

TerminusDBViewer.prototype.getRulesForListOfDocuments = function(woql) {
	var table = woql.table();
	table.column('Label').header('Document');
	table.column('Comment').header('Description');
	table.column('Type_Comment').header('Type Description');
	return table;
}

TerminusDBViewer.prototype.getRulesForGraphOfDocuments = function(woql){
	var graph = woql.graph();
	graph.height(500).width(1250);
	return graph;
}

TerminusDBViewer.prototype.getBodyAsDOM = function(docs, docClasses){
	 if(this.page == "docs"){
		 return this.getDocumentsDOM(docs, docClasses);
	 }
	 else {
		 return this.getHomeDOM(docs, docClasses);
	 }
}

TerminusDBViewer.prototype.getHomeDOM = function(docs, docClasses){
	if(this.body){
		TerminusClient.FrameHelper.removeChildren(this.body);
	}
	else {
		this.body = document.createElement("div");
		this.body.setAttribute("class", "terminus-home-body terminus-document-view");
		//this.body.setAttribute('style', 'display: table-caption;');
	}
	if(docs.count() > 0){
		this.body.appendChild(this.showHappyBox("dbhome", "demo"));
		this.body.appendChild(this.showHappyBox("dbhome", "intro"));
		this.body.appendChild(this.showHappyBox("happy", "query"));
		var delw = this.getDeleteDatabaseWidget();
		var config = TerminusClient.WOQL.document();
		config.show_all("SimpleFrameViewer");
		config.object().features("id", "type", "comment", "save", "value");
		config.property().features("label", "value");
		config.data().features("value");
		
		var cont = document.createElement("span");
		this.body.appendChild(cont);
		var mydb = this.ui.db();
		this.ui.connectToDB("terminus");
		this.insertDocument("doc:" + mydb, cont, config);
		this.ui.connectToDB(mydb); 
	}
	else if(docClasses.count() > 0) {
		var dchooser = this.getCreateDataChooser(docClasses,
			{showQuery: false, editQuery: false},
			{showConfig: false, editConfig: false});
		if(docClasses.count() <= 3){
			this.body.appendChild(this.showHappyBox("empty", "schema"));
			this.body.appendChild(this.showHappyBox("empty", "query"));
			if(docClasses.count() > 0){
				this.body.appendChild(this.showHappyBox("empty", "docs", dchooser));
			}
		}
		else  {
			this.body.appendChild(this.showHappyBox("happy", "schema"));
			this.body.appendChild(this.showHappyBox("happy", "docs", dchooser));
			this.body.appendChild(this.showHappyBox("happy", "query"));
		}
	}
	else {
		this.body.appendChild(this.showHappyBox("empty", "schema"));
		this.body.appendChild(this.showHappyBox("empty", "query"));	
	}
	if(delw) this.body.appendChild(delw);
	return this.body;
}


TerminusDBViewer.prototype.getDocumentsDOM = function(docs, docClasses){
	var WOQL = TerminusClient.WOQL;
	var self = this;
	if(this.body){
		TerminusClient.FrameHelper.removeChildren(this.body);
		var body = this.body;
	}
	else {
		var body = document.createElement("div");
		body.setAttribute("class", "terminus-home-body terminus-document-view");
		//body.setAttribute('style', 'display: table-caption;');
	}
	var page_actions = document.createElement("div");
	page_actions.setAttribute("class", "terminus-home-actions");
	body.appendChild(page_actions);
	var span = document.createElement('span');
	span.setAttribute('class', 'terminus-display-flex');
	page_actions.appendChild(span);
	if(docClasses.count() > 0){
		var ch = function(cls){
			if(cls)	self.loadCreateDocumentPage(cls);
		}
		var dchooser = this.getCreateDataChooser(docClasses,
												{showQuery: false, editQuery: false},
												{showConfig: false, editConfig: true},
												 ch );
		if(docs.count() > 1) span.appendChild(dchooser);
	}
	else {
		this.ui.showError("No document classes found in schema - you must define a document, entity or relationship class before you can create documents");
	}
	if(docs.count() > 0){
		var show_doc_action = this.getShowDocumentControl();
		span.prepend(show_doc_action);
		var dp = new QueryPane(this.ui.client, docs.query, docs)
					.options({showQuery: "icon", editQuery: true});
		var table = this.getRulesForListOfDocuments(WOQL);
		var g = this.getRulesForGraphOfDocuments(WOQL);
		var options =  { showConfig: "icon", editConfig: "true", viewers: [g]};
		dp.addView(table, options);
		body.appendChild(dp.getAsDOM());
		var WOQL = TerminusClient.WOQL;
		var dburl = this.ui.client.connectionConfig.dbURL();
		var q = WOQL.from(dburl).limit(100).documentMetadata();
		q.execute(this.ui.client).then( (result) => {
			var g = new TerminusClient.WOQLResult(result, q);
			var ddp = new QueryPane(this.ui.client, g.query, g).options({showQuery: "icon", editQuery: false});
			var g2 = this.getRulesForGraphOfDocuments(WOQL);
			var options =  { showConfig: "icon", editConfig: "true", viewers: [table] };
			body.appendChild(UTILS.getHeaderDom('Graph showing links between documents'));
			ddp.addView(g2, options);
			body.appendChild(ddp.getAsDOM());
			this.container.appendChild(body);
		}).catch((e) => {
			this.ui.showError(e);
		});
	}
	else {
		if(docClasses.count() == 3){
			body.appendChild(this.showHappyBox("empty", "schema"));
			body.appendChild(this.showHappyBox("empty", "query"));
			body.appendChild(this.showHappyBox("empty", "docs", dchooser));
		}
		else {
			body.appendChild(this.showHappyBox("happy", "schema"));
			body.appendChild(this.showHappyBox("happy", "docs", dchooser));
			body.appendChild(this.showHappyBox("happy", "query"));
		}
	}
	this.body = body;
	return body;
}


TerminusDBViewer.prototype.getDeleteDatabaseWidget = function(){
	// delete database
	if(this.ui.db() == "terminus") return;
	var d = document.createElement("span");
	d.setAttribute("class", "terminus-db-widget");
	TerminusClient.FrameHelper.removeChildren(this.container);
    var del = document.createElement('button');
    del.setAttribute('class', 'terminus-btn terminus-btn-float-right terminus-home-del');
    del.setAttribute('type', 'button');
	del.appendChild(document.createTextNode('Delete Database'));
	var di = document.createElement("i");
	di.setAttribute("class", "fa fa-trash terminus-icon-padding");
	del.appendChild(di);
	var dbrec = this.ui.getDBRecord();
	if(dbrec)
		var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
	else var nm = this.ui.db();
    var self = this;
	var dbdel = this.ui.db();
	var delbut = this.ui.getDeleteDBButton(dbdel);
	if(delbut){
		d.appendChild(delbut);
	}
	return d;
}

TerminusDBViewer.prototype.styleCreateDocumentChooser = function(){
	var select = document.getElementsByClassName('woql-chooser');
	for(i=0; i<select.length; i++){
		if(select[i].type == 'select'){
			select[i].classList.add('terminus-form-doc-value');
			var self = this;
			select[i].addEventListener('change', function(){
				self.showCreateDocument(this.value);
			})
		}
	}
}

TerminusDBViewer.prototype.getCreateDataChooser = function(docClasses, qopts, ropts, change, pholder){
	var WOQL = TerminusClient.WOQL;
	pholder = (pholder ? pholder : "Create a New Document");
	qopts  = (qopts ? qopts :  { showConfig: "icon", editConfig: "true" });
	var dp = new QueryPane(this.ui.client, docClasses.query, docClasses).options(qopts);
	var chooser = WOQL.chooser().values("Class").labels("Label").titles("Comment").show_empty(pholder);

	var self = this;
	chooser.change = (change ? change : function(cls){
		if(cls)	self.loadCreateDocumentPage(cls);
	});
	ropts  = (ropts ? ropts :  { showConfig: "icon", editConfig: "true" });
	dp.addView(chooser, ropts);
	var dchooser = dp.getAsDOM();
	return dchooser;
}

TerminusDBViewer.prototype.showHappyBox = function(happy, type, chooser){
	var hbox = document.createElement("div");
	hbox.setAttribute("class", "terminus-welcome-box terminus-no-res-alert");
	var self = this;
	var sets = {};
	if(type == "schema"){
		sets.title = (happy == "happy") ? "Document Classes Created" : "No Schema Created";
		sets.text = (happy == "happy") ? "You have successfully created a schema with valid document classes!" : "You should create a schema and add at least one document classes before you add data to the system";
		sets.css = "fa fa-cog fa-2x";
	}
	else if(type == "docs"){
		sets.css = "fa fa-book fa-2x";
		sets.title = "Create Documents";
		sets.text = (happy == "happy") ? "Add data to the system through easy to use automatically generated forms for each document type" : "You should create a schema and add at least one document classes before you add data to the system";
	}
	else if(type == "intro"){
		sets.css = "fa fa-book fa-2x";
		sets.title = "View Documents";
		sets.text = "View the documents in the database and add new ones";
	}
	else if(type == "query"){
		sets.css = "fa fa-search fa-2x";
		sets.title = "Run Queries";
		sets.text = (happy == "happy") ? "You can add data to the system with queries and scripts, and import data directly from CSVs and URLs" : "You can write WOQL queries to create a schema through our query interface";
	}
	else if(type == "demo"){
		sets.css = "fa fa-database fa-2x";
		var dbrec = this.ui.getDBRecord();
		if(dbrec)
			var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
		else var nm = this.ui.db();
		sets.title = nm ;
		sets.text = "On this level we just want functions that have database granularity - collaboration, access control, database meta-data...";
	}
	var ispan =  document.createElement("span");
	var ic = document.createElement("i");
	ic.setAttribute("class", sets.css);
	ispan.appendChild(ic);
	hbox.appendChild(ispan);
	var htit = document.createElement("span");
	htit.appendChild(document.createElement("strong").appendChild(document.createTextNode(" " + sets.title)));
	hbox.appendChild(htit);
	var body = document.createElement("p");
	body.appendChild(document.createTextNode(sets.text));
	hbox.appendChild(body);
	if(type == "schema"){
		hbox.addEventListener("click", function(){
			self.ui.page = "schema";
			self.ui.showSchemaPage();
			self.ui.redrawControls();
		});
	};
	if(type == "intro"){
		hbox.addEventListener("click", function(){
			self.ui.page = "docs";
			self.ui.showDocumentPage();
			self.ui.redrawControls();
		});
	};
	if(type == "query"){
		hbox.addEventListener("click", function(){
			self.ui.page = "query";
			self.ui.showQueryPage();
			self.ui.redrawControls();
		});
	};
	if(type == "query" || type == "schema" || type == "intro"){
		hbox.addEventListener('mouseover', function(){
            this.style.cursor = "pointer";
		});
	}
	if(type == "docs"){
		hbox.appendChild(chooser);
	}
	return hbox;
}

TerminusDBViewer.prototype.loadCreateDocumentPage = function(cls){
	this.ui.page = "docs";
	this.ui.redrawControls();
	var WOQL = TerminusClient.WOQL;
	var dburl = this.ui.client.connectionConfig.dbURL();

	var df = new DocumentPane(this.ui.client).options({
		showQuery: "icon",
		editQuery: false,
		loadDocument: this.getShowDocumentControl(),
	});
	var q2 = WOQL.from(dburl).concreteDocumentClasses();
	q2.execute(this.ui.client).then( (result2) => {
		var docClasses = new TerminusClient.WOQLResult(result2, q2);
		var dchooser = this.getCreateDataChooser(docClasses, {showQuery: "icon", editQuery: false},  { showConfig: "icon", editConfig: "true" } );
		df.setClassLoader(dchooser);
	});
	var config = WOQL.document().load_schema(true);
	config.show_all("SimpleFrameViewer");
	config.object().features("id", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value").mode("edit");//"summary", "viewer", "status",
	config.property().features("value", "label").mode("edit");//features("id", "cardinality", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "status",
	config.data().features("value").mode("edit");//.dataviewer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});

	df.loadClass(cls, config).then(() => {
		this.pages.push("New " + cls);
		TerminusClient.FrameHelper.removeChildren(this.container);
		var nav = this.getNavigationDOM();
		this.container.appendChild(nav);
		this.container.appendChild(df.getAsDOM());
	});
}

TerminusDBViewer.prototype.getNavigationDOM = function(){
	var s = document.createElement("span");
	s.setAttribute('class', 'terminus-back-to-home terminus-backtohome-span');
	var i = document.createElement("span");
	i.setAttribute("class", "fa fas fa-arrow-left");
	s.appendChild(i);
	var p =  this.pages[this.pages.length-2];
	s.appendChild(document.createTextNode(" back to " + p));
	s.addEventListener("click", () => {
		var pp = this.pages.pop();
		p =  this.pages[this.pages.length-1];
		if(p == "home"){
			//this.ui.page = "docs";
			this.getAsDOM();
		}
		else {
			pp = this.pages.pop();
			this.showDocumentPage(pp);
		}
	});
	s.addEventListener('mouseover', function(){
		this.style.cursor = "pointer";
	});
	return s;
}

TerminusDBViewer.prototype.insertDocument = function(docid, insertDOM, config){
	var df = new DocumentPane(this.ui.client).options(config);
	return df.loadDocument(docid, config).then(() => {
		insertDOM.appendChild(df.getAsDOM());
	})
	.catch((e) => this.ui.showError(e));	
}

TerminusDBViewer.prototype.showDocumentPage = function(docid){
	this.ui.page = "docs";
	this.ui.redrawControls();
	var start = docid.substring(0, 4);
	if(start != "doc:" && start != "http") docid = "doc:" + docid;
	var WOQL = TerminusClient.WOQL;
	var dburl = this.ui.client.connectionConfig.dbURL();
	var df = new DocumentPane(this.ui.client).options({
		showQuery: "icon",
		editQuery: true,
		loadDocument: this.getShowDocumentControl(),
	});
	var q2 = WOQL.from(dburl).concreteDocumentClasses();
	q2.execute(this.ui.client).then( (result2) => {
		var docClasses = new TerminusClient.WOQLResult(result2, q2);
		var dchooser = this.getCreateDataChooser(docClasses, {showQuery: "icon", editQuery: false},  { showConfig: "icon", editConfig: "true" } );
		df.setClassLoader(dchooser);
	});


	var config = WOQL.document().load_schema(true);
	config.show_all("SimpleFrameViewer");
	config.object().features("id", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "viewer", "status",
	config.property().features("value");//features("id", "cardinality", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "status",
	config.data().features("value");//.dataviewer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});

	this.pages.push(docid);
	TerminusClient.FrameHelper.removeChildren(this.container);
	this.insertDocument(docid, this.container, config);
}

TerminusDBViewer.prototype.getShowDocumentControl = function(){
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-get-doc terminus-document-chooser terminus-form-horizontal terminus-control-group");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-document-chooser-label terminus-doc-control-label terminus-control-label-padding");
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-doc-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document ID to view ...");
	var nbut = document.createElement("button");
	nbut.setAttribute('class', "terminus-control-button terminus-document-button terminus-btn");
	nbut.setAttribute('title', 'Enter Document ID to view');
	var is = document.createElement('i');
	is.setAttribute('class', 'fa fa-caret-left');
	nbut.appendChild(is);
	nbut.appendChild(document.createTextNode(" Load "));
	var i = document.createElement('i');
	i.setAttribute('class', 'fa fa-caret-right');
	nbut.appendChild(i);
	var self = this;
	nbut.addEventListener("click", function(){
		if(dcip.value) {
			self.showDocumentPage(dcip.value);
		}
	})
	dcip.addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === 13 && dcip.value) {
			self.showDocumentPage(dcip.value);
		}
	});
	scd.appendChild(lab);
	scd.appendChild(dcip);
	scd.appendChild(nbut);
	return scd;
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

TerminusDBViewer.prototype.getExplanation = function(view){
	var d = document.createElement('div');
	var title = view.charAt(0).toUpperCase() + view.slice(1)
	d.appendChild(UTILS.getHeaderDom(title + ' View'));
	if(view == 'table')
		var explaination = 'Below view shows a table view of available documents within the database';
	else var explaination = 'Below view shows a graph view of how available documents are related to other documents';
	d.appendChild(document.createTextNode(explaination));
	return d;
}

TerminusDBViewer.prototype.getClassesDOM = function(d){
	var q = TerminusClient.WOQL
				.limit(25)
				.start(0)
				.documentMetadata();
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
		let qres = new TerminusClient.WOQLResult(results, query);
		var nt = nq.showResult(qres, WOQL.table(), false);
		d.appendChild(this.getExplanation('table'));
		d.appendChild(nt);
		/*qres.first()
		var n = nq.showResult(qres, WOQL.chooser());
		d.appendChild(n); */
		qres.first();
		var lg = WOQL.graph();
		lg.source("v:Subject");
		var licon2 = { color: [255,255,25], weight: 100, unicode: "\uf2bb", size:2 };
		lg.edge("v:Subject", "v:Object").icon(licon2);
		var ng = nq.showResult(qres, lg, false);
		d.appendChild(this.getExplanation('graph'));
		d.appendChild(ng);
		qres.first();
		//var sg = nq.showResult(qres, WOQL.stream());
		//d.appendChild(sg);
		//d.appendChild(nc);
		//var ng = nq.displayResults(false, WOQL.graph());
		//d.appendChild(ng);
		/*let t = WOQL.table().pager(false);
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
		/*var x = "doc:access_all_areas";
		var nd = WOQL.document();
		nd.show_all("SimpleFrameViewer");
		nd.object().features("id", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "viewer", "status",
		nd.property().features("value");//features("id", "cardinality", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "status",
		nd.data().features("value");//.dataviewer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});
		var d1 = nq.document(x, nd);
		d.appendChild(d1); */
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

/**
 * Class Representing the create Database form
 * @param {TerminusUI} ui
 */
function TerminusDBCreator(ui){
	this.ui = ui;
}

TerminusDBCreator.prototype.getAsDOM = function(selected){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-db-creator");
	var sct = document.createElement("h3");
	sct.setAttribute("class", "terminus-db-creator-title terminus-module-head");
	sct.appendChild(UTILS.getHeaderDom("Create Database"));
	scd.appendChild(sct);
	var mfd = document.createElement('div');
	mfd.setAttribute('class', 'terminus-form-border ');
	scd.appendChild(mfd);
	var dht = document.createElement('div');
	dht.setAttribute('class', 'terminus-form-margin-top');
	mfd.appendChild(dht);
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
	cancbut.setAttribute("class", "terminus-control-button terminus-cancel-db-button terminus-btn terminus-btn-float-right");
	cancbut.appendChild(document.createTextNode("Cancel"));
	var loadbut = document.createElement("button");
	loadbut.setAttribute("class", "terminus-control-button terminus-create-db-button terminus-btn terminus-btn-float-right");
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
