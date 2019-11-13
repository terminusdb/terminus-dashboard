const TerminusClient = require('@terminusdb/terminus-client');
const WOQLTable = require("./viewer/WOQLTable");
const WOQLChoice = require("./viewer/WOQLChooser");
const WOQLQueryViewer = require("./viewer/WOQLQueryView");
const WOQLGraph = require("./viewer/WOQLGraph");
const WOQLStream = require("./viewer/WOQLStream");
const Datatypes = require("./html/Datatypes");
const QueryPane = require("./html/QueryPane");
const SimpleTable = require("./html/table/SimpleTable");
const SimpleGraph = require("./html/graph/SimpleGraph");
const SimpleTextbox = require("./html/query/SimpleTextbox");
const SimpleChooser = require("./html/chooser/SimpleChooser");

/*
 * Simple wrapper functions for initialising 
 * table, stream, graph, chooser, woql and documents
 */

function TerminusHTMLViewer(client, config){
	this.client = client;
	if(config && config.render){
		this.render = config.render;
	}
}

TerminusHTMLViewer.prototype.setRenderers = function(config){
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
	this.loadResults(query, viewer, function(){ span.appendChild(viewer.render()); })
	return span;
}

TerminusHTMLViewer.prototype.loadResults = function(query, viewer, then){
	
	//var wqt = new WOQLTable(this.client).options(config);
	//wqt.setDatatypes(Datatypes.initialiseDataRenderers);
	//wqt.setRenderer(new SimpleTable());
	query.execute(this.client).then((results) => {
		let result = new TerminusClient.WOQLResult(results, query);
		viewer.setResult(result);
		if(then) then(viewer);
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
	var wqt = new WOQLGraph(this.client).options(config);
	return query.execute(this.client).then((results) => {
		var result = new WOQLResult(results, query);
		span.appendChild(wqt.render(result));
	});	
	return span;
}
	
TerminusHTMLViewer.prototype.document = function(id, config){
	var tdv = new TerminusDocumentViewer(this.client, config);
	Datatypes.initialiseDataRenderers(tdv.datatypes);
	if(!config['object_renderer']) config['object_renderer'] = "HTMLObjectFrameViewer";
	if(!config['property_renderer']) config['property_renderer'] = "HTMLPropertyFrameViewer";
	if(!config['data_renderer']) config['data_renderer'] = "HTMLDataFrameViewer";
	var holder = document.createElement("span");
	holder.setAttribute("class", "terminus-document terminus-document-holder");
	tdv.show(id, function(rend){
		if(rend){
			holder.appendChild(rend);
		}
	});	
	return holder;
}    

module.exports = TerminusHTMLViewer;



