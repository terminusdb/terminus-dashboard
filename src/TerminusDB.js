/*
 * User Interface elements dealing with database level functions - view, delete, create, db
 * view document etc
 */
const UTILS=require('./Utils');
const TerminusClient = require('@terminusdb/terminus-client');
const HTMLHelper = require('./html/HTMLHelper');
const TerminusViewer = require("./html/TerminusViewer");


/**
 * DB home page main function
 * @param {TerminusUI} ui
 */
function TerminusDBViewer(ui){
	this.ui = ui;
	this.tv = new TerminusViewer(ui.client);
	this.container = document.createElement("span");
	this.container.setAttribute("class", "terminus-main-page");
	this.pages = ["home"];
}

//Document configuration for DB meta-data listing on DB home page
TerminusDBViewer.prototype.getDatabaseDocumentConfig = function(){
	var property_style = "display: block; padding: 0.3em 1em;"
	var box_style = "padding: 8px; border: 1px solid #afafaf; background-color: #efefef;"
	var label_style = "display: inline-block; min-width: 100px; font-weight: 600; color: #446ba0;";
	var value_style = "font-weight: 400; color: #002856;";
	var config = TerminusClient.View.document();
	config.show_all("SimpleFrameViewer");
	config.object().style(box_style);
	config.object().headerFeatures("id").style(property_style).args({headerStyle: label_style + " padding-right: 10px;", bodyStyle: value_style, label: "Database ID", removePrefixes: true});
	config.object().headerFeatures("type").style(property_style).args({headerStyle: label_style + " padding-right: 10px;", bodyStyle: value_style})
	config.object().features("value").style(property_style);
	config.property().features("label").style(label_style);
	config.property().features("label", "value");
	config.property().property("terminus:id").hidden(true);
	config.data().features("value").style(value_style);
	return config;
}


/**
 * Query Pane Configurations
 */

//documents home page table
TerminusDBViewer.prototype.getDocumentsQueryPane = function(docs, docClasses){
	var table = TerminusClient.View.table();
	//table.pager(true);
	table.column('ID').header('Document ID');
	table.column('Label').header('Name');
	table.column('Comment').header('Description');
	table.column_order("ID", "Label", "Type", "Comment");
	var self = this;
	var x = function(row){
		self.showDocumentPage(row["v:ID"], docClasses, false, docs);
	}
	table.row().click(x);
	var qp = this.tv.getResult(docs.query, table, docs);
	return qp;
}


//Create document page pane configuration		
TerminusDBViewer.prototype.getCreateDataPaneConfig = function(){
	const pc = {
		showQuery: false, 
		editQuery: false
	};
	return pc;
}

//Document configuration for create document page
TerminusDBViewer.prototype.getCreateDocumentConfig = function(){
	var property_style = "display: block; padding: 0.3em 1em;"
	var box_style = "padding: 8px; border: 1px solid #afafaf; background-color: #efefef;"
	var label_style = "display: inline-block; min-width: 100px; font-weight: 600; color: #446ba0;";
	var value_style = "font-weight: 400; color: #002856;";
	
	var config = TerminusClient.View.document().load_schema(true);
	config.all().mode("edit");
	config.show_all("SimpleFrameViewer");
	config.object().style(box_style);
	config.object().depth(0).headerFeatures("id").style(property_style).args({headerStyle: label_style + " padding-right: 10px;", bodyStyle: value_style, label: "Document ID", removePrefixes: true});
	config.object().headerFeatures("type").style(property_style).args({headerStyle: label_style + " padding-right: 10px;", bodyStyle: value_style})
	config.object().features("value").style(property_style);
	config.property().features("label").style(label_style);
	config.property().features("label", "value");
	config.property().property("terminus:id").hidden(true);
	config.data().features("value").style(value_style);
	return config;
}

//Document configuration for view / edit document page
TerminusDBViewer.prototype.getShowDocumentConfig = function(){
	var property_style = "display: block; padding: 1.5em 1em 0.8em 1em; position: relative;"
	var config = TerminusClient.View.document().load_schema(true);
	config.show_all("SimpleFrameViewer");
	config.object().depth(0).style("border: 1px solid #aaa; background-color: #fafafd").headerStyle("background-color: #002856; color: white; padding: 8px; display: block; ");
	config.object().headerFeatures("id", "type").args({headerStyle: "text-align: right; display: inline-block; width: 200px; padding-right: 10px; text-weight: 600px; color: white"});
	//config.object().headerFeatures("mode").style("float: right");
	config.object().features("value").style(property_style);
	config.property().features("label", "value");
	config.property().features("label").style("text-align: right; display: inline-block; width: 200px; padding-right: 10px; font-weight: 600; color: #002856");
	config.property().features("value").style("display: inline-block; vertical-align: top");
	config.data().features("value").style("color: #002856; display: block; margin-bottom: 1em;");
	return config;
};

TerminusDBViewer.prototype.getDocumentsGraphConfig = function(res){
	var graph = TerminusClient.View.graph();
	graph.literals(false);
	graph.height(800).width(1250);
	graph.edges(["v:doc1", "v:doc2"], ["v:doc1", "v:Enttype"], ["v:doc2", "v:Enttype2"]);
	graph.node("v:Label", "v:Label2", "v:Predicate").hidden(true);
	graph.edge("v:doc1", "v:doc2").distance(100).text("v:Predicate");
	graph.edge("v:doc1", "v:Enttype").distance(100).text("Class");
	graph.edge("v:doc2", "v:Enttype2").distance(100).text("Class");
    graph.node("v:Enttype").text("v:Enttype").color([200, 250, 200]).icon({label: true, color: [15, 50, 10]}).collisionRadius(80);
    graph.node("v:Enttype2").text("v:Enttype2").color([200, 250, 200]).icon({label: true, color: [15, 50, 10]}).collisionRadius(80);
	graph.node("v:doc1").size(24).text("v:Label1").icon({label: true, color: [15, 50, 10]}).collisionRadius(80)
	graph.node("v:doc2").size(24).text("v:Label2").icon({label: true, color: [15, 50, 10]}).collisionRadius(80)
	return graph;
}

TerminusDBViewer.prototype.showDocumentGraph = function(insertDOM){
	var dburl = this.ui.client.connectionConfig.dbURL();
	var q = TerminusClient.WOQL.from(dburl).limit(200).getAllDocumentConnections();
	var qp = this.tv.getResult(q, this.getDocumentsGraphConfig());
	var dloader = this.getLoaderDOM("Terminus Server is generating the document graph");
	insertDOM.appendChild(dloader)
	insertDOM.appendChild(qp.getAsDOM());
	this.graph_query_pane = qp;
	qp.load().finally(() => insertDOM.removeChild(dloader));
}

TerminusDBViewer.prototype.showDocumentConnections = function(docid, targetDOM, docClasses, docs){
	var q = TerminusClient.WOQL.limit(50).getDocumentConnections(docid);
	var viewer = TerminusClient.View.table().column_order("Outgoing", "Incoming", "Entid", "Label", "Enttype", "Class_Label" );
	viewer.column("Entid").hidden(true);
	viewer.column("Enttype").hidden(true);
	viewer.column("Label").header("Document Name");
	viewer.column("Class_Label").header("Type");
	viewer.column("Incoming").header("Incoming Link");
	viewer.column("Outgoing").header("Outgoing Link");
	var self = this;
	var x = function(row){
		self.showDocumentPage(row["v:Entid"], docClasses, false, docs);
	}
	viewer.row().click(x);
	var graph = TerminusClient.View.graph();
	graph.literals(false);
	graph.height(800).width(1250);
	graph.edges(["v:Docid", "v:Entid"], ["v:Entid", "v:Docid"]);
	graph.node("Outgoing", "Incoming", "Label", "Enttype", "Class_Label").hidden(true);
	
	//graph.edge("v:Entid", "v:Docid").distance(200).text("v:Incoming");
	graph.edge("v:Entid", "v:Docid").v("v:Incoming").in("unknown").hidden(true);
	graph.edge("v:Entid", "v:Docid").distance(200).text("v:Incoming").color([255, 0, 0]);

	graph.edge("v:Docid", "v:Entid").v("v:Outgoing").in("unknown").hidden(true);
	graph.edge("v:Docid", "v:Entid").distance(200).text("v:Outgoing").color([0, 0, 255]);
	
	graph.node("v:Docid").text("v:Docid").icon({label: true});
	graph.node("v:Entid").text("v:Label");
	var introdom = document.createElement("h3");
	introdom.style = "margin-top: 1.5em; margin-bottom: -32px; color: #224488;"
	introdom.appendChild(document.createTextNode("Links from other documents"));
	var rpc = { intro: introdom, viewers: [graph] }
    var qp = this.tv.getQueryPane(q, [viewer], false, [rpc]);
    var dloader = this.getLoaderDOM("Fetching document relationship table");
	targetDOM.appendChild(dloader)
	targetDOM.appendChild(qp.getAsDOM());
	qp.load().finally(() => targetDOM.removeChild(dloader));
}


TerminusDBViewer.prototype.createFullDocumentPane = function(docid, result_options, target, docClasses, docs){
	var self = this;
	var func = function(v){
		self.showDocumentPage(v, docClasses, false, docs);
	};
	var dpoptions = {"HTMLEntityViewer": { "onclick": func}};
	var dp = this.tv.getDocumentPane(docid, result_options, dpoptions);	
	return dp;
}

/**
 * HTML Page drawing functions
 */

/**
 * Called first - runs set-up queries to seed UI elements
 * before drawing the page body 
 */
TerminusDBViewer.prototype.getAsDOM = function(){
	HTMLHelper.removeChildren(this.container);
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

/**
 * Two main pages - DB home page and documents section
 */
TerminusDBViewer.prototype.getBodyAsDOM = function(docs, docClasses){
	if(this.body){
		HTMLHelper.removeChildren(this.body);
	}
	else {
		this.body = document.createElement("div");
		this.body.setAttribute("class", "terminus-home-body terminus-document-view");
	}
	if(this.ui.page == "docs"){
		(this.docid ? 
			this.showDocumentPage(this.docid, docClasses, this.body, docs) :		
			this.getDocumentsDOM(docs, docClasses, this.body));
	}
	else {
		 this.getHomeDOM(docs, docClasses, this.body);
	}
	return this.body
}

/**
 * DB home page 
 */
TerminusDBViewer.prototype.getHomeDOM = function(docs, docClasses, body){
	var intro = this.showHappyBox("dbhome", "demo");
	body.appendChild(intro);
	var config = this.getDatabaseDocumentConfig();
	var cont = document.createElement("span");
	intro.appendChild(cont);
	var mydb = this.ui.db();
	this.ui.connectToDB("terminus");
	this.insertDocument("doc:" + mydb, cont, config);
	this.ui.connectToDB(mydb); 
	if(docs.count() > 0){
		body.appendChild(this.showHappyBox("dbhome", "intro"));
		body.appendChild(this.showHappyBox("happy", "query"));
	}
	else if(docClasses.count() > 0) {
		var dchooser = this.getCreateDataChooser(docClasses, docs);
		if(docClasses.count() <= 3){
			body.appendChild(this.showHappyBox("empty", "schema"));
			body.appendChild(this.showHappyBox("empty", "query"));
		}
		else  {
			body.appendChild(this.showHappyBox("happy", "docs", dchooser));
			body.appendChild(this.showHappyBox("happy", "query"));
		}
	}
	else {
		body.appendChild(this.showHappyBox("empty", "schema"));
		body.appendChild(this.showHappyBox("empty", "query"));	
	}
	var delw = this.getDeleteDatabaseWidget("fa-2x");
	if(delw) body.appendChild(this.showHappyBox("happy", "delete", delw));
	return body;
}

/**
 * Main Document Listing Page
 */
TerminusDBViewer.prototype.getDocumentsDOM = function(docs, docClasses, body){
	var mactions = this.getDocumentsMenu(docs, docClasses, body);
	if(mactions) body.appendChild(mactions);
	this.tableDOM = document.createElement("span");
	body.appendChild(this.tableDOM);
	this.graphDOM = document.createElement("span");
	this.graphDOM.setAttribute("class", "terminus-documents-graph");
	this.graphDOM.style.display = "none";
	body.appendChild(this.graphDOM);
	if(docs.count() > 0){
		if(!this.document_table) this.document_table = this.getDocumentsQueryPane(docs, docClasses);
		this.tableDOM.appendChild(this.document_table.getAsDOM());
		this.showDocumentGraph(this.graphDOM);
	}
	else {
		var dchooser = this.getCreateDataChooser(docClasses, docs);
		if(docClasses.count() <= 3){
			this.ui.showWarning("The database must have a schema before you can add documents to it")
			body.appendChild(this.showHappyBox("empty", "schema"));
			body.appendChild(this.showHappyBox("empty", "query"));
		}
		else {
			this.ui.showWarning("No documents have been added to the database");
			body.appendChild(this.showHappyBox("happy", "docs", dchooser));
			body.appendChild(this.showHappyBox("happy", "query"));
		}
	}
	return body;
}

/**
 * Document View / Edit Page
 */
TerminusDBViewer.prototype.showDocumentPage = function(docid, docClasses, target, docs){
	this.ui.clearMessages();
	HTMLHelper.removeChildren(target);
	this.ui.page = "docs";
	this.ui.redrawControls();
	var start = docid.substring(0, 4);
	if(start != "doc:" && start != "http") docid = "doc:" + docid;	
	var config = this.getShowDocumentConfig();
	var dp = this.createFullDocumentPane(docid, config, target, docClasses, docs);
	this.docid = docid; 
	this.pages.push(docid);
	var dcDOM = document.createElement("span");
	var vc = this.showDocumentConnections(docid, dcDOM, docClasses, docs);
	return dp.load().then(() => {
		HTMLHelper.removeChildren(this.container);
		var nav = this.getNavigationDOM(docClasses, docs);
		this.container.appendChild(nav);
		var mactions = this.getDocumentsMenu(docs, docClasses, this.container, docid);
		if(mactions) this.container.appendChild(mactions);
		var dx = dp.getAsDOM();
		this.container.appendChild(dx);
		this.container.appendChild(dcDOM);
	})
	.catch((e) => {
		this.ui.showError(e)
	});	
}


/**
 * Main Create New Document Page
 */
TerminusDBViewer.prototype.loadCreateDocumentPage = function(cls, docClasses, docs){
	this.ui.page = "docs";
	this.ui.redrawControls();
	var WOQL = TerminusClient.WOQL;
	var dburl = this.ui.client.connectionConfig.dbURL();
	var config = this.getCreateDocumentConfig();

	var dp = this.tv.getNewDocumentPane(cls, config);
	dp.documentLoader = this.getShowDocumentControl(docClasses, docs);
	/*var df = new DocumentPane(this.ui.client).options({
		showQuery: true,
		editQuery: true,
		showConfig: false,
		editConfig: false,
		loadDocument: this.getShowDocumentControl(docClasses, docs)
	});*/
	if(docClasses && docClasses.count() > 0){
		var dchooser = this.getCreateDataChooser(docClasses, docs );
		dp.setClassLoader(dchooser);
	}
	else {
		var q2 = WOQL.from(dburl).concreteDocumentClasses();
		q2.execute(this.ui.client).then( (result2) => {
			docClasses = (docClasses ? docClasses : new TerminusClient.WOQLResult(result2, q2));
			var dchooser = this.getCreateDataChooser(docClasses, docs );
			dp.setClassLoader(dchooser);
		});
	}
	this.container.appendChild(dp.getAsDOM());
	dp.load().then(() => {
		HTMLHelper.removeChildren(this.container);
		var nav = this.getNavigationDOM(docClasses, docs);
		this.container.appendChild(nav);
		this.container.appendChild(dp.getAsDOM());
	});
}

/**
 * Toolbox Menu on top of the page on the documents home page
 */
TerminusDBViewer.prototype.getDocumentsMenu = function(docs, docClasses, target, docid){
	var self = this;
	var page_actions = document.createElement("div");
	page_actions.setAttribute("class", "terminus-home-actions");
	var span = document.createElement('span');
	page_actions.appendChild(span);
	if(docs.count() > 0){
		var show_doc_action = this.getShowDocumentControl(docClasses, docs, target);
		span.appendChild(show_doc_action);
		if(!docid){
			var tgtd = this.getToggleGraphTableDOM();
			if(tgtd) page_actions.appendChild(tgtd);
		}
	}	
	return page_actions;//turned off create document stuff
	if(docClasses.count() > 0){
		var ch = function(cls){
			if(cls)	self.loadCreateDocumentPage(cls, docClasses, docs);
		}
		var dchooser = this.getCreateDataChooser(docClasses, docs, ch);
		if(docs.count() > 1) span.appendChild(dchooser);
	}
	else {
		this.ui.showError("No document classes found in schema - you must define a document, entity or relationship class before you can create documents");
	}
	return page_actions;
}


TerminusDBViewer.prototype.getLoaderDOM = function(msg){
	var cont = document.createElement('div');
	cont.setAttribute('class', 'terminus-busy-msg')
	cont.appendChild(document.createTextNode(msg));           
	this.ui.getBusyLoader(cont, msg);
	return cont;
}


/**
 * Switches between graph and table display modes on documents home page
 */
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

TerminusDBViewer.prototype.getDeleteDatabaseWidget = function(css){
	// delete database
	if(this.ui.db() == "terminus") return;
	var d = document.createElement("span");
	d.setAttribute("class", "terminus-db-widget");
	HTMLHelper.removeChildren(this.container);
    var del = document.createElement('button');
    del.setAttribute('class', 'terminus-btn terminus-btn-float-right terminus-home-del');
    del.setAttribute('type', 'button');
	del.appendChild(document.createTextNode('Delete Database'));
	var di = document.createElement("i");
	var icss = "fa fa-trash fa-2x terminus-icon-padding" + (css ? " " + css : "");
	di.setAttribute("class", icss);
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

TerminusDBViewer.prototype.getCreateDataChooser = function(docClasses, docs, change, pholder){
	pholder = (pholder ? pholder : "Create a New Document");
	//qopts  = (qopts ? qopts :  {});
	//var dp = new QueryPane(this.ui.client, docClasses.query, docClasses).options(qopts);
	var chooser = TerminusClient.View.chooser().values("Class").labels("Label").titles("Comment").show_empty(pholder);
	
	var self = this;
	chooser.change = (change ? change : function(cls){
		if(cls)	self.loadCreateDocumentPage(cls, docClasses, docs);
	});
	var dp = this.tv.getResult(docClasses.query, chooser, docClasses);
	var dchooser = dp.getAsDOM();
	return dchooser;
}

TerminusDBViewer.prototype.showHappyBox = function(happy, type, chooser){
	var hbox = document.createElement("div");
	hbox.setAttribute("class", "terminus-welcome-box terminus-no-res-alert");
	var self = this;
	var sets = {};
	if(type == "schema"){
		sets.title = (happy == "happy") ? "Document Classes Created" : "Create Schema from OWL";
		sets.text = (happy == "happy") ? "You have successfully created a schema with valid document classes!" : "You can create a schema for your database from an OWL document";
		sets.css = "fa fa-cog fa-2x terminus-welcome-icons";
	}
	else if(type == "docs"){
		sets.css = "fa fa-book fa-2x terminus-welcome-icons";
		sets.title = "Create Documents";
		sets.text = (happy == "happy") ? "Add data to the system through easy to use automatically generated forms for each document type" : "You should create a schema and add at least one document classes before you add data to the system";
	}
	else if(type == "intro"){
		sets.css = "fa fa-book fa-2x terminus-welcome-icons";
		sets.title = "View Documents";
		sets.text = "View the documents in the database and add new ones";
	}
	else if(type == "query"){
		sets.css = "fa fa-search fa-2x terminus-welcome-icons";
		sets.title = (happy == "happy") ? "Run Queries" : "Create Schema with Queries";
		sets.text = (happy == "happy") ? "You can add data to the system with queries and scripts, and import data directly from CSVs and URLs" : "You can write WOQL queries to create a schema through our query interface";
	}
	else if(type == "demo"){
		sets.css = "fa fa-database fa-2x terminus-welcome-icons";
		var dbrec = this.ui.getDBRecord();
		if(dbrec)
			var nm = (dbrec["rdfs:label"] && dbrec["rdfs:label"]["@value"] ? dbrec["rdfs:label"]["@value"] : this.ui.db());
		else var nm = this.ui.db();
		sets.title = nm ;
		sets.text = "";
	}
	else if(type == "delete"){
		sets.css = "fa fa-trash fa-2x terminus-welcome-icons terminus-db-list-del-icon";
		sets.title = "Delete Database";
		sets.text = "This will delete all data and permanently remove all record of this database from the system";
	}
	var ispan =  document.createElement("span");
	ispan.setAttribute("class", "terminus-db-widget");
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
			self.ui.clearMessages();
			self.ui.redrawControls();
		});
	};
	if(type == "delete"){
		ispan.addEventListener("click", function(){
			self.ui.clearMessages();
			let db = self.ui.db();
			let deleteConfirm = confirm(`This action is irreversible, it will remove the database from the system permanently. Are you sure you want to delete ${db} Database?`);
			if (deleteConfirm == true) {
				self.ui.deleteDatabase();
				self.ui.client.connectionConfig.dbid = false;
				self.ui.redrawControls();
			}
		});
	}
	if(type == "intro" || (type == "docs" && false && !chooser)){
		hbox.addEventListener("click", function(){
			self.ui.page = "docs";
			self.ui.showDocumentPage();
			self.ui.clearMessages();
			self.ui.redrawControls();
		});
	};
	if(type == "query"){
		hbox.addEventListener("click", function(){
			self.ui.page = "query";
			self.ui.showQueryPage();
			self.ui.clearMessages();
			self.ui.redrawControls();
		});
	};
	if(type == "query" || type == "schema" || type == "intro"){
		hbox.addEventListener('mouseover', function(){
			this.style.cursor = "pointer";
		});
	}
	if(type == "docs" && false && chooser){
		var sp = document.createElement('span');
		sp.setAttribute('class', 'terminus-welcome-chooser');
		sp.appendChild(chooser);
		hbox.appendChild(sp);
	}
	return hbox;
}

TerminusDBViewer.prototype.getNavigationDOM = function(docClasses, docs){
	var s = document.createElement("span");
	s.setAttribute('class', 'terminus-back-to-home terminus-backtohome-span');
	var i = document.createElement("span");
	i.setAttribute("class", "fa fas fa-arrow-left");
	s.appendChild(i);
	var p =  this.pages[this.pages.length-2];
	if(p){
		var msg = (p == "home" ? "document list" : p)
		s.appendChild(document.createTextNode(" back to " + msg));
	}
	else {
		this.pages.push("home");
		s.appendChild(document.createTextNode(" back to document list "));
	}
	s.addEventListener("click", () => {
		var pp = this.pages.pop();
		p =  this.pages[this.pages.length-1];
		if(p == "home"){
			delete(this["docid"]);
			this.getAsDOM();
		}
		else {
			pp = this.pages.pop();
			this.docid = pp;
			this.showDocumentPage(pp, docClasses, false, docs);
		}
	});
	s.addEventListener('mouseover', function(){
		this.style.cursor = "pointer";
	});
	return s;
}

TerminusDBViewer.prototype.insertDocument = function(docid, insertDOM, config, nuke){
	var dp = this.tv.getDocument(docid, config);
	dp.load().then(() => {
		if(nuke) HTMLHelper.removeChildren(insertDOM);
		insertDOM.appendChild(dp.getAsDOM());
	})
	.catch((e) => this.ui.showError(e));	
}

TerminusDBViewer.prototype.getShowDocumentControl = function(docClasses, docs, target){
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
			self.showDocumentPage(dcip.value, docClasses, target, docs);
		}
	})
	dcip.addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === 13 && dcip.value) {
			self.showDocumentPage(dcip.value, docClasses, target, docs);
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
		//input.schema = schem.value;
		//input.key = kip.value;
		//input.data = datip.value;
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
		   if(p == "db") {
			   a.classList.add("terminus-selected");
			   self.ui.page = "db";
		   }
		   a.addEventListener("click", function(event){
			   event.stopPropagation();
			   self.ui.showDBMainPage();
			   self.ui.page = "db";
			   self.ui.clearMessages();
			   self.ui.redrawControls();
		   });
	   }
	   if(this.ui.showControl("get_document")){
		   var item = this.getControlHTML("Documents", "fas fa fa-book");
		   if(p == "docs") item.classList.add("terminus-selected");
		   item.addEventListener("click", function(event){
			   event.stopPropagation();
			   self.ui.showDocumentPage();
			   self.ui.clearMessages();
			   self.ui.page = "docs";
			   self.ui.redrawControls();
			});
		   ul.appendChild(item);
	   }
	   if(this.ui.showControl("delete_database")){
		   var item = this.getControlHTML("Delete Database", "fa-trash-alt");
		   item.addEventListener("click", function(event){
			   UTILS.activateSelectedNav(this, self);
			   self.ui.clearMessages();
			   self.ui.deleteDatabase();
		   });
		   ul.appendChild(item);
	   }
	   if(this.ui.showControl("woql_select")){
		   var item = this.getControlHTML("Query", "fa-search");
		   if(p == "query") item.classList.add("terminus-selected");
		   item.addEventListener("click", function(event){
			   UTILS.activateSelectedNav(this, self);
			   event.stopPropagation();
			   self.ui.page = "query";
			   self.ui.showQueryPage();
			   self.ui.clearMessages();
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
			   self.ui.clearMessages();
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



module.exports={TerminusDBViewer:TerminusDBViewer,
	            TerminusDBController:TerminusDBController,
	            TerminusDBCreator:TerminusDBCreator}
