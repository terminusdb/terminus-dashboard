/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
const UTILS=require('./Utils');
const TerminusClient = require('@terminusdb/terminus-client');
const QueryPane = require("./html/QueryPane");
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
		a.href = "#";
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
	a.href = "#";
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

TerminusDBViewer.prototype.getDocumentsQueryPane = function(docs){
	var dp = new QueryPane(this.ui.client, docs.query, docs).options({showQuery: false, editQuery: false});
	var table = TerminusClient.WOQL.table();
	table.column('ID').header('Document ID');
	table.column('Label').header('Name');
	table.column('Comment').header('Description');
	table.column_order("ID", "Label", "Comment", "Type");
	//table.column('Type_Comment').header('Type Description');
	var result_options =  { showConfig: false, editConfig: false};
	dp.addView(table, result_options);
	return dp;
}

		
TerminusDBViewer.prototype.getCreateDataPaneConfig = function(){
	const pc = {showQuery: false, editQuery: false};
	return pc;
}

TerminusDBViewer.prototype.getShowDocumentPaneConfig = function(){
	const pc = {showConfig: false, editConfig: false};
	return pc;
}

TerminusDBViewer.prototype.getCreateDocumentConfig = function(){
	var config = TerminusClient.WOQL.document().load_schema(true);
	config.show_all("SimpleFrameViewer");
	config.object().features("id", "type", "value").mode("edit");
	config.property().features("label", "value").mode("edit");
	config.data().features("value").mode("edit");
	return config;
}

TerminusDBViewer.prototype.getShowDocumentConfig = function(){
	var config = WOQL.document().load_schema(true);
	config.show_all("SimpleFrameViewer");
	config.object().features("id", "type", "comment", "delete", "reset", "hide", "show", "clone", "update", "view", "add", "value");//"summary", "viewer", "status",
	config.property().features("label", "value", "type", "cardinality");
	config.data().features("value");
};

TerminusDBViewer.prototype.getGraphQueryPane = function(res){
	var graph = TerminusClient.WOQL.graph();
	graph.height(800).width(1250);
	const opts = {showQuery: false, editQuery: false}
	var ddp = new QueryPane(this.ui.client, res.query, res).options(opts);
	const result_opts = {showConfig: false, editConfig: false}
	ddp.addView(graph, result_opts);
	return ddp;
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


TerminusDBViewer.prototype.getDocumentsMenu = function(docs, docClasses){
	var self = this;
	var page_actions = document.createElement("div");
	page_actions.setAttribute("class", "terminus-home-actions");
	var span = document.createElement('span');
	page_actions.appendChild(span);
	if(docs.count() > 0){
		var show_doc_action = this.getShowDocumentControl();
		span.appendChild(show_doc_action);
	}	
	if(docClasses.count() > 0){
		var ch = function(cls){
			if(cls)	self.loadCreateDocumentPage(cls);
		}
		var dpc = this.getCreateDataPaneConfig();
		var oc = this.getShowDocumentPaneConfig();
		var dchooser = this.getCreateDataChooser(docClasses, dpc, oc, ch);
		if(docs.count() > 1) span.appendChild(dchooser);
	}
	else {
		this.ui.showError("No document classes found in schema - you must define a document, entity or relationship class before you can create documents");
	}
	var tgtd = this.getToggleGraphTableDOM();
	if(tgtd) page_actions.appendChild(tgtd);
	return page_actions;
}

TerminusDBViewer.prototype.redrawDocumentPage = function(){
	if(this.docview == "graph"){
		this.tableDOM.style.display = "none";
		this.graphDOM.style.display = "inline";
	}
	else {
		this.tableDOM.style.display = "inline";
		this.graphDOM.style.display = "none";
	}
}	

TerminusDBViewer.prototype.getDocumentsDOM = function(docs, docClasses){
	if(this.body){
		TerminusClient.FrameHelper.removeChildren(this.body);
		var body = this.body;
	}
	else {
		var body = document.createElement("div");
		body.setAttribute("class", "terminus-home-body terminus-document-view");
	}
	var mactions = this.getDocumentsMenu(docs, docClasses);
	if(mactions) body.appendChild(mactions);
	this.graphDOM = document.createElement("span");
	body.appendChild(this.graphDOM);
	this.tableDOM = document.createElement("span");
	body.appendChild(this.tableDOM);
	if(docs.count() > 0){
		if(this.docview && this.docview == "graph"){
			this.showDocumentGraph(this.graphDOM);
		}
		else {
			if(!this.document_table) this.document_table = this.getDocumentsQueryPane(docs);
			this.tableDOM.appendChild(this.document_table.getAsDOM());
		}
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

TerminusDBViewer.prototype.showDocumentGraph = function(insertDOM){
	var WOQL = TerminusClient.WOQL;
	var dburl = this.ui.client.connectionConfig.dbURL();
	var q = WOQL.from(dburl).limit(100).documentMetadata();
	q.execute(this.ui.client).then( (result) => {
		var res = new TerminusClient.WOQLResult(result, q);
		var ddp = this.getGraphQueryPane(res);
		insertDOM.appendChild(ddp.getAsDOM());
		this.graph_query_pane = ddp;
	}).catch((e) => {
		this.ui.showError(e);
	});
}

TerminusDBViewer.prototype.getToggleGraphTableDOM = function(){
	// delete database
	var isp = document.createElement('span');
	isp.setAttribute("class", "terminus-toggle-documents");
	var tisp = document.createElement('span');
	var gisp = document.createElement('span');
	isp.appendChild(tisp);
	isp.appendChild(gisp);
	var ticon = document.createElement("i");
	ticon.setAttribute("class", "fa fa-table");
	ticon.classList.add('terminus-result-view-icon');
	var gicon = document.createElement("i");
	tisp.appendChild(ticon);
	gisp.appendChild(gicon);
	gisp.setAttribute("title", "Click to view a graph of the links between the documents in the database");
	tisp.setAttribute("title", "Switch back to a regular table of documents");
	gicon.setAttribute("class", "fas fa-code-branch");
	gicon.classList.add('terminus-result-view-icon');
	if(this.docview && this.docview == "graph"){
		gisp.style.display = "none";
	}
	else {
		tisp.style.display = "none";
	}

	var hov = function(ticon){
		tisp.addEventListener('mouseover', function(){
			this.style.cursor = "pointer";
		});
	}
	hov(gisp);
	hov(tisp);

	gisp.addEventListener("click", () => {
		if(this.docview && this.docview == "graph") return;
		if(!this.graph_query_pane){
			this.showDocumentGraph(this.graphDOM);
		}
		this.docview = "graph";
		gisp.style.display = "none";
		this.graphDOM.style.display = "inline";
		tisp.style.display = "inline";
		this.tableDOM.style.display = "none";

	});
	ticon.addEventListener("click", () => {
		if(!this.docview || this.docview == "table") return;
		this.docview = "table";
		tisp.style.display = "none";
		gisp.style.display = "inline";
		this.graphDOM.style.display = "none";
		this.tableDOM.style.display = "inline";
	});
	isp.appendChild(tisp);
	isp.appendChild(gisp);
	return isp;	
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
		sets.css = "fa fa-cog fa-2x terminus-welcome-icons";
	}
	else if(type == "docs"){
		sets.css = "fa fa-book fa-2x terminus-welcome-icons";
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
		sets.css = "fa fa-search fa-2x terminus-welcome-icons";
		sets.title = "Run Queries";
		sets.text = (happy == "happy") ? "You can add data to the system with queries and scripts, and import data directly from CSVs and URLs" : "You can write WOQL queries to create a schema through our query interface";
	}
	else if(type == "demo"){
		sets.css = "fa fa-database fa-2x terminus-welcome-icons";
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
	htit.appendChild(document.createElement("strong").appendChild(document.createTextNode(sets.title)));
	htit.classList.add('terminus-welcome-title');
	hbox.appendChild(htit);
	var body = document.createElement("p");
	body.setAttribute('class', 'terminus-welcome-body');
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
		var sp = document.createElement('span');
		sp.setAttribute('class', 'terminus-welcome-chooser');
		sp.appendChild(chooser);
		hbox.appendChild(sp);
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

	var config = this.getCreateDocumentConfig();
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

	var config = this.getShowDocumentConfig();
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
