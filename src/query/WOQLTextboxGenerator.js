const TerminusClassChooser = require('../client/TerminusClassChooser');
const TerminusPropertyChooser = require('../client/TerminusPropertyChooser');
const TerminusDocumentChooser = require('../client/TerminusDocumentChooser');
const UTILS= require('../Utils')
const TerminusClient = require('@terminusdb/terminus-client');

function WOQLTextboxGenerator(tq, qman, ui){
	this.query = tq;
	this.wquery = qman.wquery;
	this.ui = ui;
	this.queryMode = 'woql';
	// default datatable settings if datatable plug in available
	this.datatable = {};
	this.datatable.pageLength = 25;
	this.datatable.start = 0;
}

WOQLTextboxGenerator.prototype.gathersettings = function(txtArea, queryName){
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

WOQLTextboxGenerator.prototype.setsettings = function(query){
	if(query.limit){
		this.datatable.pageLength = query.limit[0];
		this.datatable.start = query.limit[1].start[0];
	}
}

WOQLTextboxGenerator.prototype.getQueryFormatSelect = function(qip){
	var fsel = document.createElement('select');
	fsel.setAttribute('class', 'terminus-doc-config');
	var owoql = document.createElement('option');
	owoql.setAttribute('value', 'woql');
	owoql.appendChild(document.createTextNode('WOQL'));
	fsel.appendChild(owoql);
	var ojson = document.createElement('option');
	ojson.setAttribute('value', 'jsonld');
	ojson.appendChild(document.createTextNode('JSON-LD'));
	fsel.appendChild(ojson);
	this.datatable.queryMode = fsel;
	var self = this;
	fsel.addEventListener('change', function(){
		self.queryMode = this.value;
		self.ui.clearMessages();
		updatePagination(qip.value);
		UTILS.deleteStylizedEditor(self.ui, qip);
		// self.datatable should hold the current datatables pagination  values
		var qObj = UTILS.getCurrentWoqlQueryObject(self.currentQuery, self.datatable);
		if(!qObj){
			qip.value = 'Enter new query or load queries from example buttons provided on right hand side ...';
		}
		else{
			if(self.queryMode == 'woql')
				qip.value = 'WOQL.' + qObj.prettyPrint();
			else qip.value = JSON.stringify(qObj.query, undefined, 2);
		}
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			//self.gathersettings(qip, 'Show_All_Schema_Elements');
			self.query(qObj, self.datatable);
		}
		else self.query(qObj);
	})
	return fsel;
}

WOQLTextboxGenerator.prototype.updatePagination = function(query){

}

WOQLTextboxGenerator.prototype.processDynamicQuery = function(query){
	query = query;
    query = 'const WOQL = TerminusClient.WOQL ; return ' + query;
    var qObj = new Function(query)();
    var qJson = qObj.json();
    var newQObj= TerminusClient.WOQL.json(JSON.parse(JSON.stringify(qJson)))
    return newQObj;
}

WOQLTextboxGenerator.prototype.getQueryTextAreaDOM = function(q, box){
	var qbox = document.createElement("span");
	qbox.setAttribute("class", "terminus-query-textbox-input terminus-query-section");

	var head = document.createElement('span');
	var eqh = document.createElement("H3");
	eqh.appendChild(document.createTextNode("Enter Query in format"));
	eqh.setAttribute('class', 'terminus-full-css-margin-top terminus-query-head');
	head.appendChild(eqh);
    // text area to enter query
	var qip = document.createElement("textarea");
	qip.setAttribute("class", "terminus-query-box");
	qip.setAttribute("placeholder", "Enter new query or load queries from example buttons provided below ...");
	qip.setAttribute("style", "min-width: 400px; min-height: 60px;");
	if(q) qip.value = JSON.stringify(q,undefined, 2);
	// select to display or write in supported query formats - woql or jsonld
	var fmt = this.getQueryFormatSelect(qip);
	head.appendChild(fmt);
	qbox.appendChild(head);
	qbox.appendChild(qip);
	UTILS.stylizeEditor(this.ui, qip, 'query', 'javascript');
	var self = this;
	var qbut = document.createElement("button");
	qbut.setAttribute("class", "terminus-control-button terminus-btn")
	qbut.appendChild(document.createTextNode("Send Query"));
	qbut.addEventListener("click", function(){
		self.ui.clearMessages();
		try {
			var qObj = self.processDynamicQuery(qip.value);
			if(self.ui.pluginAvailable("datatables")){
				// pass current Example query scope while editing the text editor
				self.gathersettings(qip, self.datatable.query);
				self.query(qObj, self.datatable);
			}
			else self.query(qObj);
		}
		catch(e){
			alert("Failed to parse Query " + e.toString());
		}
	})
	qbox.appendChild(qbut);
	box.appendChild(qbox);
	return qip;
}


WOQLTextboxGenerator.prototype.redrawQueryPage = function(qip){
	this.ui.clearMessages();
	UTILS.deleteStylizedEditor(this.ui, qip);
	var qObj = UTILS.getCurrentWoqlQueryObject(this.currentQuery, this.datatable);
	if(this.queryMode == 'woql')
		qip.value = 'WOQL.' + qObj.prettyPrint();
	else qip.value =  JSON.stringify(qObj.query, undefined, 2);
	UTILS.stylizeEditor(this.ui, qip, 'query', 'javascript');
	if(this.ui.pluginAvailable("datatables")){
		this.gathersettings(qip, this.currentQuery);
		this.query(qObj, this.datatable);
	}
	else this.query(qObj);
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
		self.currentQuery =  'Show_All_Classes';
		self.redrawQueryPage(qip);
	})

	var aqbut = document.createElement("button");
	aqbut.appendChild(document.createTextNode("Show Document Classes"));
	aqbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	aqbut.addEventListener("click", function(){
		self.currentQuery =  'Show_Document_Classes';
		self.redrawQueryPage(qip);

		/*self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qObjue = self.wquery.getClassMetaDataQuery(self.wquery.getConcreteDocumentClassPattern("v:Element"),
														self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qObjue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gathersettings(qip, 'Show_Document_Classes');
			self.query(qObjue, self.datatable);
		}
		else self.query(qObjue); */
	})

	var ebut = document.createElement("button");
	ebut.appendChild(document.createTextNode("Show All Schema Elements"));
	ebut.setAttribute("class", "terminus-control-button terminus-q-btn");
	var self = this;
	ebut.addEventListener("click", function(){
		self.currentQuery =  'Show_All_Schema_Elements';
		self.redrawQueryPage(qip);
	})
	var dbut = document.createElement("button");
	dbut.appendChild(document.createTextNode("Show All Documents"));
	dbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	dbut.addEventListener("click", function(){
		self.currentQuery = 'Show_All_Documents';
		self.redrawQueryPage(qip);
	})
	var pbut = document.createElement("button");
	pbut.appendChild(document.createTextNode("Show All Data"));
	pbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	pbut.addEventListener("click", function(){
		self.currentQuery = 'Show_All_Data';
		self.redrawQueryPage(qip);
	})

	var prbut = document.createElement("button");
	prbut.appendChild(document.createTextNode("Show All Properties"));
	prbut.setAttribute("class", "terminus-control-button terminus-q-btn");
	prbut.addEventListener("click", function(){
		self.currentQuery = 'Show_All_Properties';
		self.redrawQueryPage(qip);
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
			var qObjue = self.wquery.getDataOfChosenClassQuery(new_class, self.datatable.pageLength, self.datatable.start);
			qip.value = JSON.stringify(qObjue,undefined, 2);
			UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
			if(self.ui.pluginAvailable("datatables")){
				self.gathersettings(qip, 'Show_Data_Class');
				self.datatable.chosenValue = new_class; // set chosen val from drop down
				self.query(qObjue, self.datatable);
			}
			else self.query(qObjue);
		}
	}
	var tcdom = termcc.getAsDOM('terminus-query-select');

	var termpc = new TerminusPropertyChooser(this.ui);
	termpc.empty_choice = "Show property data";
	var self = this;
	termpc.change = function(new_property){
		if(new_property){
			UTILS.deleteStylizedEditor(self.ui, qip);
			var qObjue = self.wquery.getDataOfChosenPropertyQuery(new_property, self.datatable.pageLength, self.datatable.start);
			qip.value = JSON.stringify(qObjue,undefined, 2);
			UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
			if(self.ui.pluginAvailable("datatables")){
				self.gathersettings(qip, 'Show_Property_Class');
				self.datatable.chosenValue = new_property; // set chosen val from drop down
				self.query(qObjue, self.datatable);
			}
			else self.query(qObjue);
		}
	}

	/* grouping document queries */
	var qdocGroup = this.qGroupQueries(qrow, 'Document Queries', '');

	var pdom = termpc.getAsDOM();

	var docch = new TerminusDocumentChooser(this.ui);
	docch.change = function(val){
		self.ui.clearMessages();
		UTILS.deleteStylizedEditor(self.ui, qip);
		var qObjue = self.wquery.getDocumentQuery(val, self.datatable.pageLength, self.datatable.start);
		qip.value = JSON.stringify(qObjue,undefined, 2);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gathersettings(qip, 'Show_Document_Info_by_Id');
			self.datatable.chosenValue = val;
			self.query(qObjue, self.datatable);
		}
		else self.query(qObjue);
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
