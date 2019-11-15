const TerminusClient = require('@terminusdb/terminus-client');
const WOQLRule = require("./viewer/WOQLRule");
const WOQLTable = require("./viewer/WOQLTable");
const WOQLChooser = require("./viewer/WOQLChooser");
const WOQLQueryViewer = require("./viewer/WOQLQueryView");
const WOQLGraph = require("./viewer/WOQLGraph");
const WOQLStream = require("./viewer/WOQLStream");
const TerminusFrame = require("./viewer/TerminusFrame");
const Datatypes = require("./html/Datatypes");
const QueryPane = require("./html/QueryPane");
const SimpleTable = require("./html/table/SimpleTable");
const SimpleGraph = require("./html/graph/SimpleGraph");
const SimpleStream = require("./html/stream/SimpleStream");
const SimpleTextbox = require("./html/query/SimpleTextbox");
const SimpleChooser = require("./html/chooser/SimpleChooser");
const SimpleDocument = require("./html/document/SimpleDocument");
const DocumentTable = require("./html/document/DocumentTable");
const HTMLObjectViewer = require("./html/document/ObjectViewer");
const HTMLPropertyViewer = require("./html/document/PropertyViewer");
const HTMLDataViewer = require("./html/document/DataViewer");

/*
 * Simple wrapper functions for initialising 
 * table, stream, graph, chooser, woql and documents
 */

function TerminusHTMLViewer(client, config){
	this.client = client;
	
	this.config = config;
}

TerminusHTMLViewer.prototype.setRenderers = function(config){
}

TerminusHTMLViewer.prototype.showResult = function(result, config){
	let span = document.createElement("span");
	span.setAttribute("class", "terminus-results");
	let renderers = {
		table: new SimpleTable(),
		graph: new SimpleGraph(),
		stream: new SimpleStream(),
		chooser: new SimpleChooser()
	}	
	let viewer = config.create(this.client, renderers, Datatypes.initialiseDataRenderers);
	viewer.setResult(result);
	span.appendChild(viewer.render());
	return span;
}

TerminusHTMLViewer.prototype.displayResults = function(query, config){
	let span = document.createElement("span");
	span.setAttribute("class", "terminus-results");
	let renderers = {
			table: new SimpleTable(),
			graph: new SimpleGraph(),
		//	stream: [new SimpleStream()],
			choice: new SimpleChooser()
	}	
	let viewer = config.create(this.client, renderers, Datatypes.initialiseDataRenderers);
	if(query){
		this.loadResults(query, viewer, function(){ span.appendChild(viewer.render()); })
	}
	else {
		alert("x");
		if(this.last_result){
			viewer.setResult(this.last_result);
			span.appendChild(viewer.render());
		}
	}
	return span;
}

TerminusHTMLViewer.prototype.loadResults = function(query, viewer, then){
	var self = this;
	return query.execute(this.client).then((results) => {
		self.last_result = new TerminusClient.WOQLResult(results, query);
		viewer.setResult(self.last_result);
	});	
}

TerminusHTMLViewer.prototype.table = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-table");
	var wqt = new WOQLTable(this.client).options(config);
	wqt.setDatatypes(Datatypes.initialiseDataRenderers);
	wqt.setRenderer(new SimpleTable());
	query.execute(this.client).then((results) => {
		var result = new TerminusClient.WOQLResult(results, query);
		wqt.setResult(result);
		span.appendChild(wqt.render());
	});	
	return span;
}

TerminusHTMLViewer.prototype.stream = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-stream");
	var wqt = new WOQLStream(this.client).options(config);
	wqt.setDatatypes(Datatypes.initialiseDataRenderers);
	return query.execute(this.client).then((results) => {
		var result = new WOQLResult(results, query);
		span.appendChild(wqt.render());
	});	
	return span;
}

TerminusHTMLViewer.prototype.woql = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-woql");
	var wqt = new WOQLQueryViewer(this.client).options(config);
	span.appendChild(wqt.render());
	if(query){
		wqt.setQuery(query, true);
	}
	return span;
}

TerminusHTMLViewer.prototype.querypane = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-woql-pane");
	var qp = new QueryPane(this.client, query);
	qp.options(config);
	var wqv = new WOQLQueryViewer(this.client).options(config);
	//var wqc = new WOQLChoice(this.client).options(config);
	//var wqs = new WOQLStream(this.client).options(config);
	//var wqg = new WOQLGraph(this.client).options(config);
	//var wqt = new WOQLTable(this.client).options(config)
	wqv.setRenderer(new SimpleTextbox(wqv));
	//wqt.setRenderer(new SimpleTable());
	//wqg.setRenderer(new SimpleGraph());
	//wqt.setDatatypes(Datatypes.initialiseDataRenderers);
	//wqs.setDatatypes(Datatypes.initialiseDataRenderers);
	qp.addQueryViewer(wqv);
	//qp.addResultViewer("Choice", wqc);
	//qp.addResultViewer("Stream", wqs);
	//qp.addResultViewer("Graph", wqg);
	//qp.addResultViewer("Table", wqt);
	qp.addResultViewer("ABC", config, new SimpleTextbox(wqv));
	span.appendChild(qp.render());
	return span;
}


TerminusHTMLViewer.prototype.chooser = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-chooser");
	var wqt = new WOQLChoice(this.client).options(config);
	return query.execute(this.client).then((results) => {
		var result = new WOQLResult(results, query);
		span.appendChild(wqt.render(result));
	});	
	return span;
}

TerminusHTMLViewer.prototype.graph = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-graph terminus-graph-holder");
	var wqt = new WOQLGraph(this.client).options(config);
	return query.execute(this.client).then((results) => {
		var result = new WOQLResult(results, query);
		span.appendChild(wqt.render(result));
	});	
	return span;
}

TerminusHTMLViewer.prototype.lmg = function(config){
	config.show_all("HTMLObjectViewer", "HTMLPropertyViewer", "HTMLDataViewer");
}

TerminusHTMLViewer.prototype.document = function(id, config){
	var holder = document.createElement("span");
	holder.setAttribute("class", "terminus-document terminus-document-holder");
	//config.renderer(new DocumentTable());
	this.lmg(config);
	var tdv = new TerminusFrame(this.client).options(config);
	tdv.owner = this;
	tdv.setDatatypes(Datatypes.initialiseDataRenderers);
	tdv.loadDocument(id).then(() => { 
		let dom = tdv.render(); 
		if(dom) holder.appendChild(dom);
	});
	return holder;
}    

TerminusHTMLViewer.prototype.loadRenderer = function(rendname, frame, args){
	var evalstr = "new " + rendname + "(";
	if(args) evalstr += JSON.stringify(args);
	evalstr += ");";
	try {
		var nr = eval(evalstr);
		return nr;
	}
	catch(e){
		console.log("Failed to load " + rendname + e.toString());
		return false;
	}
}


module.exports = TerminusHTMLViewer;



