const TerminusClient = require('@terminusdb/terminus-client');
const WOQLRule = require("../viewer/WOQLRule");
const WOQLTable = require("../viewer/WOQLTable");
const WOQLChooser = require("../viewer/WOQLChooser");
//const WOQLQueryViewer = require("./viewer/WOQLQueryView");
const WOQLGraph = require("../viewer/WOQLGraph");
const WOQLStream = require("../viewer/WOQLStream");
const TerminusFrame = require("../viewer/TerminusFrame");
const Datatypes = require("./Datatypes");
const SimpleTable = require("./table/SimpleTable");
const SimpleGraph = require("./graph/SimpleGraph");
const SimpleStream = require("./stream/SimpleStream");
//const SimpleTextbox = require("./html/query/SimpleTextbox");
const SimpleChooser = require("./chooser/SimpleChooser");
const SimpleDocument = require("./document/SimpleDocument");
const DocumentTable = require("./document/DocumentTable");
const SimpleFrameViewer = require("./document/SimpleFrameViewer");
const HTMLObjectViewer = require("./document/ObjectViewer");
const HTMLPropertyViewer = require("./document/PropertyViewer");
const HTMLDataViewer = require("./document/DataViewer");
const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const UTILS = require('../Utils');

/**
 * Provides access to the two basic HTML views supported by the system: 
 * QueryPane(, [rvs])
 * DocumentPane(qeditor, [rvs])
 * ScriptPane(seditor, sv)
 */


function TerminusHTMLViewer(client){
	this.client = client;
	this.config = config;
}

TerminusHTMLViewer.prototype.setRenderers = function(config){
}

TerminusHTMLViewer.prototype.getEditor = function(width, height, placeholder){
    var woql = TerminusClient.WOQL;
	var tcs = new TerminusCodeSnippet({}, width, height, placeholder, this.mode);
	var snippet = tcs.getAsDOM();
	var dimensions = {};
	dimensions.width = width;
	dimensions.height = height;
	UTILS.stylizeEditor(this.ui, snippet.snippetText, dimensions, 'javascript');
	return snippet;
}

TerminusHTMLViewer.prototype.showConfigEditor = function(result, config, span){
    var cSnippet = this.getEditor(300, 250,
                        JSON.stringify(config, undefined, 2));
    var self = this;
    cSnippet.actionButton.addEventListener('click', function(){
        try{
            //self.submitConfigRules(woql, cSnippet, qSnippet, rSnippet);
			var cObj = UTILS.getqObjFromInput(cSnippet.snippetText.value);
			TerminusClient.FrameHelper.removeChildren(span);
			span.appendChild(self.showResult(result, cObj));
        }
        catch(e){
            //self.ui.showError('Error in config editor: ' + e);
			console.log('Error in config editor: ' + e);
        }
    })
    return cSnippet;
}

TerminusHTMLViewer.prototype.submitConfig = function(result, config, span, cdom){
	var cSnippet = this.showConfigEditor(result, config, span);
	cdom.appendChild(cSnippet.dom);
}

TerminusHTMLViewer.prototype.showConfig = function(result, config, span, cdom){
	var cbtn = document.createElement('button');
    //cbtn.setAttribute('style', 'margin-top: 10px;');
    cbtn.setAttribute('class', 'terminus-btn terminus-query-config-btn');
    cbtn.appendChild(document.createTextNode('Config'));
    //rSnippet.dom.appendChild(cbtn);
    //qSnippet.dom.appendChild(cbtn);
    var self = this;
    cbtn.addEventListener('click', function(){
		TerminusClient.FrameHelper.removeChildren(cdom);
        self.submitConfig(result, config, span, cdom);
    })
    return cbtn;
}

TerminusHTMLViewer.prototype.showResult = function(result, config, cDisplay){
	let span = document.createElement("span");
	span.setAttribute("class", "terminus-query-results");
	result.first();
	let renderers = {
		table: new SimpleTable(),
		graph: new SimpleGraph(),
		stream: new SimpleStream(),
		chooser: new SimpleChooser()
	}
	let viewer = config.create(this.client, renderers, Datatypes.initialiseDataRenderers);
	viewer.setResult(result);
	span.appendChild(viewer.render());
	var cdom = document.createElement('div');
	span.appendChild(cdom);
	if(cDisplay) span.appendChild(this.showConfig(result, config, span, cdom));
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
		console.log('self.last_result', self.last_result);
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
	this.queryViewer = wqv;

	// Query Viewer
/*	var tcs = new TerminusCodeSnippet({}, 800, 250, 'Enter Query', 'edit');
	var snippet = tcs.getAsDOM();
	span.appendChild(snippet.dom);
	//span.appendChild(this.ruleEditor());
	var abtn = snippet.actionButton;
	var self = this; */
	// On submit query
	/*abtn.addEventListener('click', function(){
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
	/*})
	*/

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
	span.setAttribute("class", "terminus-graph terminus-graph-holder");
	var wqt = new WOQLGraph(this.client).options(config);
	return query.execute(this.client).then((results) => {
		var result = new WOQLResult(results, query);
		span.appendChild(wqt.render(result));
	});
	return span;
}

TerminusHTMLViewer.prototype.document = function(id, config){
	var holder = document.createElement("span");
	holder.setAttribute("class", "terminus-document terminus-document-holder");
	//config.renderer(new DocumentTable());
	//config.show_all("SimpleFrameViewer");
	var tdv = new TerminusFrame(this.client).options(config);
	tdv.owner = this;
	tdv.setDatatypes(Datatypes.initialiseDataRenderers);
	tdv.loadDocument(id).then(() => {
		let dom = tdv.render();
		if(dom) holder.appendChild(dom);
	});
	return holder;
}

TerminusHTMLViewer.prototype.loadRenderer = function(rendname, frame, args, termframe){
	var evalstr = "new " + rendname + "(";
	if(args) evalstr += JSON.stringify(args);
	evalstr += ");";
	try {
		var nr = eval(evalstr);
		nr.terminus = termframe;
		return nr;
	}
	catch(e){
		console.log("Failed to load " + rendname + e.toString());
		return false;
	}
}

module.exports = TerminusHTMLViewer;
