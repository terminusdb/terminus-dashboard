const TerminusPluginManager = require('../plugins/TerminusPlugin');
const Datatables = require('../plugins/datatables.terminus');
const FrameHelper = require('../FrameHelper');

function WOQLResult(res, query, options){
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



function WOQLResultsViewer(ui, wresult, options, settings){
	this.ui = ui;
	this.result = wresult;
	this.options = options;
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
		console.log("no bindings for query");
	}
}

WOQLResultsViewer.prototype.getTableDOM = function(bindings, resultDOM){
	if(this.pman.pluginAvailable("datatables")){
		var dtResult = this.getTable(bindings, true);
		resultDOM.appendChild(dtResult.tab);
    	var dt = new Datatables();
		dt.draw(true, dtResult, this.settings, this.ui, resultDOM);
		resultDOM.classList.add('terminus-expandable');
		resultDOM.classList.add('terminus-dt-result-cont');
		return tab;
    }
	else{
		var tab = this.getTable(bindings, false);
		resultDOM.appendChild(tab);
	}
}

WOQLResultsViewer.prototype.formatResultsForDatatableDisplay = function(bindings){
    var columns = [], colDataData = {}, data = [], formattedResult = {};
	var dtResult = {};
    var ordered_headings = this.orderColumns(bindings[0]);
	// get columns
	for(var i = 0; i<ordered_headings.length; i++){
		var clab = FrameHelper.validURL(ordered_headings[i]) ? FrameHelper.labelFromURL(ordered_headings[i]) : ordered_headings[i];
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
			}
			colDataData[ordered_headings[j]] = lab;
		}
		data.push(colDataData);
	}
	dtResult.columns = columns;
	//formattedResult.push({data: data, recordsTotal: '65'});
	formattedResult.data = data;
	formattedResult.recordsTotal = '65';
	dtResult.data = formattedResult;
	return dtResult;
}

WOQLResultsViewer.prototype.getTableBody = function(bindings, ordered_headings){
	var tbody = document.createElement("tbody");
	for(var i = 0; i<bindings.length; i++){
		var tr = document.createElement("tr");
		for(var j = 0; j<ordered_headings.length; j++){
			var td = document.createElement("td");
			if(typeof bindings[i][ordered_headings[j]] == "object"){
				var lab = (bindings[i][ordered_headings[j]]['@value'] ? bindings[i][ordered_headings[j]]['@value'] : "Object?");
				td.appendChild(document.createTextNode(lab));
			}
			else if(typeof bindings[i][ordered_headings[j]] == "string") {
				var lab = this.result.shorten(bindings[i][ordered_headings[j]]);
				if(lab == "unknown") lab = "";
				td.appendChild(document.createTextNode(lab));
			}
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	return tbody;
}

WOQLResultsViewer.prototype.getTable = function(bindings, dtPlugin){
	var tab = document.createElement("table");
	tab.setAttribute("class", "terminus-query-results-table");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var ordered_headings = this.orderColumns(bindings[0]);
	for(var i = 0; i<ordered_headings.length; i++){
		var th = document.createElement("th");
		th.setAttribute('class', 'terminus-table-header-full-css');
		var clab = (ordered_headings[i].indexOf("http") != -1) ? FrameHelper.labelFromURL(ordered_headings[i]) : ordered_headings[i];
		th.appendChild(document.createTextNode(clab));
		thr.appendChild(th);
	}
	thead.appendChild(thr);
	tab.appendChild(thead);
	if(dtPlugin){
		var tbody = document.createElement("tbody");
		tab.appendChild(tbody);
		var dtResult ={};
		dtResult.result = this.formatResultsForDatatableDisplay(bindings);
		dtResult.tab = tab;
		return dtResult;
	}
	else {
		var tbody = this.getTableBody(bindings , ordered_headings);
		tab.appendChild(tbody);
		return tab;
	}
}


module.exports={WOQLResultsViewer, WOQLResult}
