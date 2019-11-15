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
const TerminusCodeSnippet = require('./viewer/TerminusCodeSnippet');

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

TerminusHTMLViewer.prototype.ruleEditor = function(){
	var woql = TerminusClient.WOQL;
	var cont = document.createElement('div');
	var tcs = new TerminusCodeSnippet({}, 500, 250, 'Enter rules ...', 'edit');
	var snippet = tcs.getAsDOM();
	cont.appendChild(snippet.dom);
	return cont;
}

TerminusHTMLViewer.prototype.getAddRuleButton = function(cont){
	var rbtn = document.createElement('button');
	rbtn.appendChild(document.createTextNode('Add another rule'));
	var self = this;
	rbtn.addEventListener('click', function(){
		//self.QueryPane.addResultViewer("Choice", wqc);
		//qp.addResultViewer("Choice", wqc);
		//addResultViewer = function(label, rule, ruleviewer){
	})
	cont.appendChild(rbtn);
}

TerminusHTMLViewer.prototype.getConfigButton = function(cont){
	var cbtn = document.createElement('button');
	cbtn.appendChild(document.createTextNode('Rule'));
	var self = this;
	cbtn.addEventListener('click', function(){
		cont.appendChild(self.ruleEditor());
		self.getAddRuleButton(cont);
	})
	cont.appendChild(cbtn);
}

TerminusHTMLViewer.prototype.querypane = function(query, config){
	var span = document.createElement("span");
	span.setAttribute("class", "terminus-woql-pane");
	var qp = new QueryPane(this.client, query);
	qp.options(config);
	this.queryPane = qp;
	var wqv = new WOQLQueryViewer(this.client).options(config);

	// Query Viewer
	var tcs = new TerminusCodeSnippet({}, 800, 250, 'Enter Query', 'edit');
	var snippet = tcs.getAsDOM();
	span.appendChild(snippet.dom);
	//span.appendChild(this.ruleEditor());
	var abtn = snippet.actionButton;
	var self = this;
	// On submit query
	abtn.addEventListener('click', function(){
		var qObj = wqv.getqObjFromInput(snippet.snippetText.value);
		let t = TerminusClient.WOQL.table();
		console.log('t', t);


		span.appendChild(self.displayResults(qObj, t));
		self.getConfigButton(span);

		/*qObj.execute(self.client).then(function(response){
			// default result in table format
			let t = TerminusClient.WOQL.table();
			let res = TerminusClient.WOQLResult(response, qObj, t);
			/*t.column("Label").header("Document");
			t.column("Range").header("Range");
			t.column("Domain").header("Domain");
			t.column("Comment").header("Description");
			t.column("Comment").renderer("HTMLStringViewer").args({max_cell_size: 20, max_word_size: 10});
		    t.column_order("Label", "Type", "Comment");*/
		/*	span.appendChild(self.displayResults(res, t));
			self.getConfigButton(span);
		}) */
		//wqv.submitQuery(qObj);
	})


	//console.log('wqv', wqv);
	//var wqc = new WOQLChoice(this.client).options(config);
	//var wqs = new WOQLStream(this.client).options(config);
	//var wqg = new WOQLGraph(this.client).options(config);
	//var wqt = new WOQLTable(this.client).options(config)
	//wqv.setRenderer(new SimpleTextbox(wqv, 1000, 600));
	//wqt.setRenderer(new SimpleTable());
	//wqg.setRenderer(new SimpleGraph());
	//wqt.setDatatypes(Datatypes.initialiseDataRenderers);
	//wqs.setDatatypes(Datatypes.initialiseDataRenderers);
	//qp.addQueryViewer(wqv);
	//qp.addResultViewer("Choice", wqc);
	//qp.addResultViewer("Stream", wqs);
	//qp.addResultViewer("Graph", wqg);
	//qp.addResultViewer("Table", wqt);

	//qp.addResultViewer("ABC", config, new SimpleTextbox(wqv, 1000, 600));
	//span.appendChild(qp.render());

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
