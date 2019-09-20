const FrameHelper = require('../FrameHelper');
const TerminusClassChooser = require('../client/TerminusClassChooser');
const TerminusPropertyChooser = require('../client/TerminusPropertyChooser');
const TerminusDocumentChooser = require('../client/TerminusDocumentChooser');
const UTILS= require('../Utils')
function WOQLTextboxGenerator(tq, qman, ui){
	this.query = tq;
	this.wquery = qman.wquery;
	this.ui = ui;
	// default datatable settings if datatable plug in available
	this.datatable = {};
	this.datatable.pageLength = 5;
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
	var g = document.createElement('div');
	g.setAttribute('class', 'terminus-group-box');

	var cd = document.createElement('div');
	cd.setAttribute('class', 'terminus-group');
	g.appendChild(cd);

	var ch = document.createElement('div');
	ch.setAttribute('class', 'terminus-group-header');
	cd.appendChild(ch);

	var h = document.createElement('h3');
	h.appendChild(document.createTextNode(header));
	ch.appendChild(h);

	var t = document.createElement('h5');
	t.setAttribute('class', 'terminus-group-sub-title');
	t.appendChild(document.createTextNode(descr));
	ch.appendChild(t);

	qrow.appendChild(g);

	return g;
}

WOQLTextboxGenerator.prototype.setDatatableSettings = function(query){
	var newQuery = query.replace(/\s/g,'');  // remove spaces
	var searchStr = 'limit(';
	if(newQuery.indexOf(searchStr) !== -1){
		var remString = newQuery.substring(searchStr.length, newQuery.length);
		var limit = remString.substr(0, remString.indexOf(','));
		this.datatable.pageLength = limit;
		this.datatable.start = 0;
	}
}

WOQLTextboxGenerator.prototype.getQueryTextAreaDOM = function(q, box){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-textbox-input");

	var eqh = document.createElement("H3");
	eqh.appendChild(document.createTextNode("Enter Query"));
	eqh.setAttribute('class', 'terminus-full-css-margin-top terminus-module-head');
	qbox.appendChild(eqh);

	var qip = document.createElement("textarea");
	qip.setAttribute("class", "terminus-query-box");
	qip.setAttribute("placeholder", "Enter new query or load queries from example buttons provided below ...");
	qip.setAttribute("style", "min-width: 400px; min-height: 60px;");
	if(q) qip.value = q;
	qbox.appendChild(qip);
	UTILS.stylizeEditor(this.ui, qip, 'query', 'javascript');
	var self = this;
	var qbut = document.createElement("button");
	qbut.setAttribute("class", "terminus-control-button terminus-query-btn")
	qbut.appendChild(document.createTextNode("Send Query"));
	qbut.addEventListener("click", function(){
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Any_Query');
			self.setDatatableSettings(qip.value);
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
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
	qexs.setAttribute("class", "terminus-query-examples terminus-db-list-title ");
	var qh = document.createElement("H3");
	qh.appendChild(document.createTextNode("Load query from examples"));
	qh.setAttribute('class', 'terminus-full-css-margin-top terminus-module-head');
	qexs.appendChild(qh);

	var qrow = this.getQueryButtonGroups(qexs);
	qexs.appendChild(qrow);

	/* grouping class queries */
	var qcGroup = this.qGroupQueries(qrow, 'Schema Queries', 'descr blah blah');

	var nqbut = document.createElement("button");
	nqbut.appendChild(document.createTextNode("Show All Classes"));
	nqbut.setAttribute("class", "terminus-control-button terminus-query-btn terminus-query-btn-size");
	nqbut.addEventListener("click", function(){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getClassMetaDataQuery(null, self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Classes');
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	})

	var aqbut = document.createElement("button");
	aqbut.appendChild(document.createTextNode("Show Document Classes"));
	aqbut.setAttribute("class", "terminus-control-button terminus-query-btn terminus-query-btn-size");
	aqbut.addEventListener("click", function(){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getClassMetaDataQuery(self.wquery.getSubclassQueryPattern("Class", "dcog/'Document'")
														+ ", not(" + self.wquery.getAbstractQueryPattern("Class") + ")",
														self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_Document_Classes');
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	})

	var ebut = document.createElement("button");
	ebut.appendChild(document.createTextNode("Show All Schema Elements"));
	ebut.setAttribute("class", "terminus-control-button terminus-query-btn terminus-query-btn-size");
	var self = this;
	ebut.addEventListener("click", function(){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getElementMetaDataQuery(null, self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Schema_Elements');
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	})
	var dbut = document.createElement("button");
	dbut.appendChild(document.createTextNode("Show All Documents"));
	dbut.setAttribute("class", "terminus-control-button terminus-query-btn terminus-query-btn-size");
	dbut.addEventListener("click", function(){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getAllDocumentQuery(null, self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Documents');
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	})
	var pbut = document.createElement("button");
	pbut.appendChild(document.createTextNode("Show All Data"));
	pbut.setAttribute("class", "terminus-control-button terminus-query-btn terminus-query-btn-size");
	pbut.addEventListener("click", function(){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getEverythingQuery(null, self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Data');
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	})

	var prbut = document.createElement("button");
	prbut.appendChild(document.createTextNode("Show All Properties"));
	prbut.setAttribute("class", "terminus-control-button terminus-query-btn terminus-query-btn-size");
	prbut.addEventListener("click", function(){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getPropertyListQuery(null, self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_All_Properties');
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	})

	/* grouping data queries */
	var qdGroup = this.qGroupQueries(qrow, 'Data Queries', 'descr blah blah');

	var termcc = new TerminusClassChooser(this.ui);
	termcc.empty_choice = "View data of type...";
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			UTILS.deleteStylizedEditor(self.ui, qip);
			qip.value = self.wquery.getDataOfChosenClassQuery(new_class, self.datatable.pageLength, self.datatable.start);
			UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
			if(self.ui.pluginAvailable("datatables")){
				self.gatherDatatableSettings(qip, 'Show_Data_Class');
				self.datatable.chosenValue = new_class; // set chosen val from drop down
				self.query(qip.value, self.datatable);
			}
			else self.query(qip.value);
		}
	}
	var tcdom = termcc.getAsDOM('terminus-query-select');

	var termpc = new TerminusPropertyChooser(this.ui);
	termpc.empty_choice = "Show data for property...";
	var self = this;
	termpc.change = function(new_property){
		if(new_property){
			UTILS.deleteStylizedEditor(self.ui, qip);
			qip.value = self.wquery.getDataOfChosenPropertyQuery(new_property, self.datatable.pageLength, self.datatable.start);
			UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
			if(self.ui.pluginAvailable("datatables")){
				self.gatherDatatableSettings(qip, 'Show_Property_Class');
				self.datatable.chosenValue = new_property; // set chosen val from drop down
				self.query(qip.value, self.datatable);
			}
			else self.query(qip.value);
		}
	}

	/* grouping document queries */
	var qdocGroup = this.qGroupQueries(qrow, 'Document Queries', 'descr blah blah');

	var pdom = termpc.getAsDOM();
	var docch = new TerminusDocumentChooser(this.ui);
	docch.change = function(val){
		UTILS.deleteStylizedEditor(self.ui, qip);
		qip.value = self.wquery.getDocumentQuery(val, self.datatable.pageLength, self.datatable.start);
		UTILS.stylizeEditor(self.ui, qip, 'query', 'javascript');
		if(self.ui.pluginAvailable("datatables")){
			self.gatherDatatableSettings(qip, 'Show_Document_Info_by_Id');
			self.datatable.chosenValue = val;
			self.query(qip.value, self.datatable);
		}
		else self.query(qip.value);
	}
	var docdom = docch.getAsDOM('terminus-query-select');
	var d2ch = new TerminusDocumentChooser(this.ui, FrameHelper.unshorten("dcog:Document"));
	d2ch.view = "label";
	var d2dom = d2ch.getAsDOM('terminus-query-select');
	var p = document.createElement("p");
	p.appendChild(d2dom);

	/* class queries */
	qcGroup.appendChild(ebut);
	var br = document.createElement('BR');
	qcGroup.appendChild(br);
	qcGroup.appendChild(nqbut);
	var br = document.createElement('BR');
	qcGroup.appendChild(br);
	qcGroup.appendChild(aqbut);
	var br = document.createElement('BR');
	qcGroup.appendChild(br);
	qcGroup.appendChild(prbut);
	var br = document.createElement('BR');
	qcGroup.appendChild(br);

	qbox.appendChild(qexs);

	/* data queries */
	qdGroup.appendChild(tcdom);
	qdGroup.appendChild(pdom);
	var br = document.createElement('BR');
	qdGroup.appendChild(br);
	qdGroup.appendChild(pbut);

	/* document queries */
	qdocGroup.appendChild(docdom);
	qdocGroup.appendChild(dbut);
	qdocGroup.appendChild(p);

	return qbox;
}

module.exports=WOQLTextboxGenerator
