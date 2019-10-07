const TerminusClassChooser = require('../client/TerminusClassChooser');
const TerminusPropertyChooser = require('../client/TerminusPropertyChooser');
const TerminusDocumentChooser = require('../client/TerminusDocumentChooser');
const UTILS= require('../Utils')
const TerminusClient = require('@terminusdb/terminus-client');

function WOQLTextboxGenerator(tq, qman, ui){
	this.query = tq;
	this.wquery = qman.wquery;
	this.ui = ui;
	// default datatable settings if datatable plug in available
	this.datatable = {};
	this.datatable.pageLength = 20;
	this.datatable.start = 0;
}

WOQLTextboxGenerator.prototype.gatherDatatableSettings = function(txtArea, queryName){
	this.datatable.qTextDom =  txtArea;
	this.datatable.query =  queryName;
	this.datatable.chosenValue = null;
}

WOQLTextboxGenerator.prototype.getQueryButtonGroups = function(qbox){
	var row = document.createElement('div');
	row.setAttribute('class', 'terminus-query-group-row');
	qbox.appendChild(row);
	return row;
}

WOQLTextboxGenerator.prototype.qGroupQueries = function(qrow, header, descr){
	var g = document.createElement('button');
	var self = this;
	g.addEventListener('click', function(e){
		self.ui.clearMessages();
		if(header == 'Data Queries'){ // to ensure click event is not on button but on select instead so no need to hide
			var target = e.target || e.srcElement,
        	text = target.textContent || target.innerText;
			if((target.nodeName == 'SELECT')) return;
		}
		else if(header == 'Document Queries'){
			var target = e.target || e.srcElement,
        	text = target.textContent || target.innerText;
			if((target.nodeName == 'INPUT')) return;
		}
		for(var i=0; i<this.children.length ; i++){
			UTILS.toggleVisibility(this.children[i]);
		}
		var qeb = document.getElementsByClassName('query-example-buttons');
		for(var i=0; i<qeb.length ; i++){
			if(this != qeb[i]){
				for(var j=0; j<qeb[i].children.length ; j++){
					if(qeb[i].children[j].classList.contains('terminus-display')){
						qeb[i].children[j].classList.remove('terminus-display');
						qeb[i].children[j].classList.add('terminus-hide');
				    }
				}
			}
		}
	})

	g.setAttribute('class', 'terminus-group-box terminus-pointer query-example-buttons');

	var cd = document.createElement('div');
	cd.setAttribute('class', 'terminus-group');
	g.appendChild(cd);

	var ch = document.createElement('div');
	ch.setAttribute('class', 'terminus-group-header');
	cd.appendChild(ch);

	var d = document.createElement('div');
	d.setAttribute('class', 'terminus-query-block-headers')
	d.appendChild(document.createTextNode(header));
	ch.appendChild(d);
	ic = document.createElement('i');
    ic.setAttribute('class', 'terminus-hand-pointer-float fa fa-hand-pointer');
	d.appendChild(ic);

	var t = document.createElement('h5');
	t.setAttribute('class', 'terminus-group-sub-title terminus-hide');
	t.appendChild(document.createTextNode(descr));
	g.appendChild(t);

	qrow.appendChild(g);

	return g;
}

WOQLTextboxGenerator.prototype.setDatatableSettings = function(query){
	if(query.limit){
		this.datatable.pageLength = query.limit[0];
		this.datatable.start = query.limit[1].start[0];
	}
	/*
	var newQuery = query.replace(/\s/g,'');  // remove spaces
	var searchStr = 'limit(';
	if(newQuery.indexOf(searchStr) !== -1){
		var remString = newQuery.substring(searchStr.length, newQuery.length);
		var limit = remString.substr(0, remString.indexOf(','));
		this.datatable.pageLength = limit;
		this.datatable.start = 0;
	}*/
}

WOQLTextboxGenerator.prototype.getQueryTextAreaDOM = function(q, box){
	var qbox = document.createElement("span");
	qbox.setAttribute("class", "terminus-query-textbox-input terminus-query-section");

	var eqh = document.createElement("H3");
	eqh.appendChild(document.createTextNode("Enter Query"));
	eqh.setAttribute('class', 'terminus-full-css-margin-top terminus-module-head');
	qbox.appendChild(eqh);

	var qip = document.createElement("textarea");
	qip.setAttribute("class", "terminus-query-box");
	qip.setAttribute("placeholder", "Enter new query or load queries from example buttons provided below ...");
	qip.setAttribute("style", "min-width: 400px; min-height: 60px;");
	if(q) qip.value = JSON.stringify(q,undefined, 2);
	qbox.appendChild(qip);
	UTILS.stylizeEditor(this.ui, qip, 'query', 'javascript');
	var self = this;
	var qbut = document.createElement("button");
	qbut.setAttribute("class", "terminus-control-button terminus-btn")
	qbut.appendChild(document.createTextNode("Send Query"));
	qbut.addEventListener("click", function(){
		self.ui.clearMessages();
		try {
			var qval = JSON.parse(qip.value);
			if(self.ui.pluginAvailable("datatables")){
				// pass current Example query scope while editing the text editor
				self.gatherDatatableSettings(qip, self.datatable.query);
				self.setDatatableSettings(qval);
				self.query(qval, self.datatable);
			}
			else self.query(qval);
		}
		catch(e){
			alert("Failed to parse Query " + e.toString());
		}
	})
	qbox.appendChild(qbut);
	box.appendChild(qbox);
	return qip;
}

WOQLTextboxGenerator.prototype.getAsDOM = function(q, qip){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-textbox-input");
	var qbuts = document.createElement("div");
	qbuts.setAttribute("class", "terminus-control-buttons");
	//qbuts.appendChild(qbut);
	qbox.appendChild(qbuts);
	var qexs = document.createElement("div");
	qexs.setAttribute("class", "terminus-query-examples terminus-db-list-title");
	var qh = document.createElement("H3");
	qh.appendChild(document.createTextNode("Saved Queries"));
	qh.setAttribute('class', 'terminus-full-css-margin-top terminus-module-head');
	qexs.appendChild(qh);

	var qrow = this.getQueryButtonGroups(qexs);
	qexs.appendChild(qrow);

	/* grouping class queries */
	var qcGroup = this.qGroupQueries(qrow, 'Schema Queries', '');

	var nqbut = document.createElement("button");
	nqbut.appendChild(document.createTextNode("Show All Classes"));
	nqbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	nqbut.addEventListener("click", function(){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qval = self.wquery.getClassMetaDataQuery(null, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qval,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Classes');
			self.query(qval, self.datatable);
		}
		else self.query(qval);
	})

	var aqbut = document.createElement("button");
	aqbut.appendChild(document.createTextNode("Show Document Classes"));
	aqbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	aqbut.addEventListener("click", function(){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qvalue = self.wquery.getClassMetaDataQuery(self.wquery.getConcreteDocumentClassPattern("v:Element"),
														self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qvalue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_Document_Classes');
			self.query(qvalue, self.datatable);
		}
		else self.query(qvalue);
	})

	var ebut = document.createElement("button");
	ebut.appendChild(document.createTextNode("Show All Schema Elements"));
	ebut.setAttribute("class", "terminus-control-button terminus-q-btn");
	var self = this;
	ebut.addEventListener("click", function(){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qval = self.wquery.getElementMetaDataQuery(null, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qval,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Schema_Elements');
			self.query(qval, self.datatable);
		}
		else self.query(qval);
	})
	var dbut = document.createElement("button");
	dbut.appendChild(document.createTextNode("Show All Documents"));
	dbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	dbut.addEventListener("click", function(){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qvalue = self.wquery.getAllDocumentQuery(null, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qvalue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Documents');
			self.query(qvalue, self.datatable);
		}
		else self.query(qvalue);
	})
	var pbut = document.createElement("button");
	pbut.appendChild(document.createTextNode("Show All Data"));
	pbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	pbut.addEventListener("click", function(){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qvalue = self.wquery.getEverythingQuery(null, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qvalue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Data');
			self.query(qvalue, self.datatable);
		}
		else self.query(qvalue);
	})

	var prbut = document.createElement("button");
	prbut.appendChild(document.createTextNode("Show All Properties"));
	prbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	prbut.addEventListener("click", function(){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qvalue = self.wquery.getPropertyListQuery(null, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qvalue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Properties');
			self.query(qvalue, self.datatable);
		}
		else self.query(qvalue);
	})

	/* grouping data queries */
	var qdGroup = this.qGroupQueries(qrow, 'Data Queries', '');

	var termcc = new TerminusClassChooser(this.ui);
	termcc.empty_choice = "Show data of type";
	var self = this;
	termcc.change = function(new_class){
		self.ui.clearMessages();
		if(new_class){
			UTILS.deleteStylizedEditor(self.ui, qip);
			var qvalue = self.wquery.getDataOfChosenClassQuery(new_class, self.datatable.pageLength, self.datatable.start);
			qip.value = JSON.stringify(qvalue,undefined, 2);
			UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
			if(self.ui.pluginAvailable("datatables")){
				self.gatherDatatableSettings(qip, 'Show_Data_Class');
				self.datatable.chosenValue = new_class; // set chosen val from drop down
				self.query(qvalue, self.datatable);
			}
			else self.query(qvalue);
		}
	}
	var tcdom = termcc.getAsDOM('terminus-query-select');

	var termpc = new TerminusPropertyChooser(this.ui);
	termpc.empty_choice = "Show property data";
	var self = this;
	termpc.change = function(new_property){
		if(new_property){
			UTILS.deleteStylizedEditor(self.ui, qip);
			var qvalue = self.wquery.getDataOfChosenPropertyQuery(new_property, self.datatable.pageLength, self.datatable.start);
			qip.value = JSON.stringify(qvalue,undefined, 2);
			UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
			if(self.ui.pluginAvailable("datatables")){
				self.gatherDatatableSettings(qip, 'Show_Property_Class');
				self.datatable.chosenValue = new_property; // set chosen val from drop down
				self.query(qvalue, self.datatable);
			}
			else self.query(qvalue);
		}
	}

	/* grouping document queries */
	var qdocGroup = this.qGroupQueries(qrow, 'Document Queries', '');

	var pdom = termpc.getAsDOM();

	var docch = new TerminusDocumentChooser(this.ui);
	docch.change = function(val){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qvalue = self.wquery.getDocumentQuery(val, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qvalue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_Document_Info_by_Id');
			self.datatable.chosenValue = val;
			self.query(qvalue, self.datatable);
		}
		else self.query(qvalue);
	}
	var docdom = docch.getAsDOM('terminus-query-select');

	var d2ch = new TerminusDocumentChooser(this.ui, TerminusClient.FrameHelper.unshorten("tcs:Document"));
	d2ch.view = "label";
	d2ch.change = docch.change;
	var d2dom = d2ch.getAsDOM('terminus-query-select');
	var p = document.createElement("p");
	p.appendChild(d2dom);

	/* class queries */
	var clGroup = document.createElement('div');
	clGroup.setAttribute('class', 'terminus-hide ');
	clGroup.appendChild(ebut);
	var br = document.createElement('BR');
	clGroup.appendChild(br);
	clGroup.appendChild(nqbut);
	var br = document.createElement('BR');
	clGroup.appendChild(br);
	clGroup.appendChild(aqbut);
	var br = document.createElement('BR');
	clGroup.appendChild(br);
	clGroup.appendChild(prbut);
	var br = document.createElement('BR');
	clGroup.appendChild(br);
	qcGroup.appendChild(clGroup);

	qbox.appendChild(qexs);

	/* data queries */
	var dtGroup = document.createElement('div');
	dtGroup.setAttribute('class', 'terminus-hide');
	dtGroup.appendChild(tcdom);
	dtGroup.appendChild(pdom);

	var br = document.createElement('BR');
	dtGroup.appendChild(br);
	dtGroup.appendChild(pbut);
	qdGroup.appendChild(dtGroup);


	/* document queries */
	var docGroup = document.createElement('div');
	docGroup.setAttribute('class', 'terminus-hide');
	docGroup.appendChild(docdom);
	docGroup.appendChild(dbut);
	//docGroup.appendChild(p);
	qdocGroup.appendChild(docGroup);

	return qbox;
}

module.exports=WOQLTextboxGenerator
