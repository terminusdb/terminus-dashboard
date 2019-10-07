const TerminusPluginManager = require('../plugins/TerminusPlugin');
const Datatables = require('../plugins/datatables.terminus');
const HTMLFrameHelper = require('../client/HTMLFrameHelper');


function WOQLResult(res, query, options, ui){
	this.ui = ui;
	this.query = query;
	this.bindings = ((res && res.bindings) ? res.bindings : []);
}

WOQLResult.prototype.count = function(){
	return this.bindings.length;
}

WOQLResult.prototype.shorten = function(url){
	return this.query.shorten(url);
}

WOQLResult.prototype.hasBindings = function(result){
	if(result) return (result.bindings && result.bindings.length);
	else return (this.bindings && this.bindings.length);
}



function WOQLResultsViewer(ui, wresult, wQuery, options, settings, queryPage){
	this.ui = ui;
	this.result = wresult;
	this.wQuery = wQuery;
	this.max_cell_size = 400;
	this.max_word_size = 60;
	this.options = options;
	this.qPage = queryPage;
	//this.wqlRes = new WOQLResult();
	this.pman = new TerminusPluginManager();
	this.settings = settings;
}

WOQLResultsViewer.prototype.showTable = function(){
	if(this.options && typeof this.options.show_table != "undefined") return this.options.show_table;
	return true;
}

WOQLResultsViewer.prototype.orderColumns = function(sample){
	var ordered = [];
	for(var h in sample){
		if(ordered.indexOf(h) == -1){
			ordered.unshift(h);
		}
	}
	return ordered;
}

WOQLResultsViewer.prototype.getAsDOM = function(resultDOM, displayResultHeader){
	var rs = document.createElement('div');
	resultDOM.appendChild(rs);
	if(displayResultHeader){
		var rh = document.createElement('div');
		rh.setAttribute("class", "terminus-margin-top-bottom terminus-module-head");
		rh.appendChild(document.createTextNode("Results"));
		rs.appendChild(rh);
	}
	if(this.result && this.result.hasBindings() && this.showTable()){
		this.getTableDOM(this.result.bindings, rs);
		return rs;
	}
	else {
		nor = document.createElement('div');
		nor.setAttribute('class', 'terminus-no-res-alert');
		nor.appendChild(document.createTextNode("No results available, create new ones to view them here..."));
		rs.appendChild(nor);
		return rs;
	}
}

WOQLResultsViewer.prototype.getTableDOM = function(bindings, resultDOM){
	if(this.pman.pluginAvailable("datatables")){
		var dtResult = this.getTable(bindings, true, {});
		resultDOM.appendChild(dtResult.tab);
		var dt = new Datatables.Datatables(this, this.qPage);
		dt.draw(dtResult, resultDOM);
		resultDOM.classList.add('terminus-expandable');
		resultDOM.classList.add('terminus-dt-result-cont');
		return tab;
    }
	else{
		var tab = this.getTable(bindings, false, {});
		resultDOM.appendChild(tab);
	}
}

WOQLResultsViewer.prototype.getDtTableDOMOnChange = function(bindings, resultDOM, pageInfo){
		var dtResult = this.getTable(bindings, true, pageInfo);
		resultDOM.appendChild(dtResult.tab);
		return dtResult;
}

WOQLResultsViewer.prototype.formatResultsForDatatableDisplay = function(bindings, pageInfo){
    var columns = [], colDataData = {}, data = [], formattedResult = {}, arr = [];
	var dtResult = {};
    var ordered_headings = this.orderColumns(bindings[0]);
	// get columns
	for(var i = 0; i<ordered_headings.length; i++){
		var clab = TerminusClient.FrameHelper.validURL(ordered_headings[i]) ? TerminusClient.FrameHelper.labelFromURL(ordered_headings[i]) : ordered_headings[i];
        columns.push({data: clab});
	}
	// get data for respective columns
	for(var i = 0; i<bindings.length; i++){
		colDataData = {};
		for(var j = 0; j<ordered_headings.length; j++){
			if(typeof bindings[i][ordered_headings[j]] == "object"){
				var lab = (bindings[i][ordered_headings[j]]['@value'] ? bindings[i][ordered_headings[j]]['@value'] : "Object?");
			}
			else if(typeof bindings[i][ordered_headings[j]] == "string") {
				var lab = this.result.shorten(bindings[i][ordered_headings[j]]);
				if(lab == "unknown") lab = "";
				if(lab.substring(0, 4) == "doc:"){
					lab = this.getDocumentLocalLink(lab).outerHTML;
				}
			}
			var clab = TerminusClient.FrameHelper.validURL(ordered_headings[j]) ? TerminusClient.FrameHelper.labelFromURL(ordered_headings[j]) : ordered_headings[j];
			colDataData[clab] = lab;
		}
		data.push(colDataData);
	}
	dtResult.columns = columns;
	formattedResult.data = data;
	formattedResult.recordsTotal = 65;
	formattedResult.recordsFiltered = 65;
	formattedResult.draw = 1;
	dtResult.data = formattedResult;
	return dtResult;
}

WOQLResultsViewer.prototype.getTableBody = function(bindings, ordered_headings){
	var tbody = document.createElement("tbody");
	var self = this;
	for(var i = 0; i<bindings.length; i++){
		var tr = document.createElement("tr");
		for(var j = 0; j<ordered_headings.length; j++){
			var td = document.createElement("td");
			if(typeof bindings[i][ordered_headings[j]] == "object"){
				var lab = (bindings[i][ordered_headings[j]]['@value'] ? bindings[i][ordered_headings[j]]['@value'] : "?");
			}
			else if(typeof bindings[i][ordered_headings[j]] == "string") {
				var lab = this.result.shorten(bindings[i][ordered_headings[j]]);
			}
			if(lab == "unknown") lab = "";
			if(lab.substring(0, 4) == "doc:"){
				var a = this.getDocumentLocalLink(lab);
				td.appendChild(a);
			}
			else {
				HTMLFrameHelper.wrapShortenedText(td, lab, this.max_cell_size, this.max_word_size);
			}
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	return tbody;
}

WOQLResultsViewer.prototype.getDocumentLocalLink = function(lab){
	var a = document.createElement("a");
	a.setAttribute("title", lab);
	a.setAttribute("href", '#');
	var self = this;
	a.addEventListener("click", function(){
		if(self.result.ui) {
			self.result.ui.showDocument(this.title);
			self.result.ui.redraw();
		}
	});
	a.appendChild(document.createTextNode(lab));
	return a;
}

WOQLResultsViewer.prototype.getTable = function(bindings, dtPlugin, pageInfo){
	var tab = document.createElement("table");
	tab.setAttribute("class", "terminus-hover-table");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var ordered_headings = this.orderColumns(bindings[0]);
	for(var i = 0; i<ordered_headings.length; i++){
		var th = document.createElement("th");
		th.setAttribute('class', 'terminus-table-header-full-css');
		var clab = (ordered_headings[i].indexOf("http") != -1) ? TerminusClient.FrameHelper.labelFromURL(ordered_headings[i]) : ordered_headings[i];
		th.appendChild(document.createTextNode(clab));
		thr.appendChild(th);
	}
	thead.appendChild(thr);
	tab.appendChild(thead);
	if(dtPlugin){
		var tbody = document.createElement("tbody");
		tab.appendChild(tbody);
		var dtResult ={};
		dtResult.result = this.formatResultsForDatatableDisplay(bindings, pageInfo);
		dtResult.tab = tab;
		return dtResult;
	}
	else {
		var tbody = this.getTableBody(bindings, ordered_headings);
		tab.appendChild(tbody);
		return tab;
	}
}


module.exports={WOQLResultsViewer, WOQLResult}
