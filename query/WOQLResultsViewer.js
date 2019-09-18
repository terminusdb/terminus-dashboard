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

WOQLResultsViewer.prototype.getAsDOM = function(resultDOM){
	var rs = document.createElement('div');
	var rh = document.createElement('div');
	rh.setAttribute("class", "terminus-margin-top-bottom terminus-module-head");
	rh.appendChild(document.createTextNode("Results"));
	rs.appendChild(rh);
	if(this.result && this.result.hasBindings() && this.showTable()){
		this.getTableDOM(this.result.bindings, rs);
		return rs;
	}
	else {
		console.log("no bindings for query");
	}
}

WOQLResultsViewer.prototype.getTableDOM = function(bindings, resultDOM){
	var tab = this.getTable(bindings);
	if(this.pman.pluginAvailable("datatables")){
    	var dt = new Datatables();
		var tab = dt.draw(true, tab, this.settings, this.ui, resultDOM);
		resultDOM.setAttribute('class', 'terminus-expandable');
		return tab;
    }
	else resultDOM.appendChild(tab);
}

WOQLResultsViewer.prototype.getTable = function(bindings){
	var tab = document.createElement("table");
	tab.setAttribute("class", "terminus-query-results-table");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var ordered_headings = this.orderColumns(bindings[0]);
	for(var i = 0; i<ordered_headings.length; i++){
		var th = document.createElement("th");
		th.setAttribute('class', 'terminus-table-header-full-css');
		th.appendChild(document.createTextNode(ordered_headings[i]));
		thr.appendChild(th);
	}
	thead.appendChild(thr);
	tab.appendChild(thead);
	var tbody = document.createElement("tbody");
	for(var i = 0; i<bindings.length; i++){
		var tr = document.createElement("tr");
		for(var j = 0; j<ordered_headings.length; j++){
			var td = document.createElement("td");
			if(typeof bindings[i][ordered_headings[j]] == "object"){
				var lab = (bindings[i][ordered_headings[j]].data ? bindings[i][ordered_headings[j]].data : "Object?");
				td.appendChild(document.createTextNode(lab));
			}
			else if(typeof bindings[i][ordered_headings[j]] == "string"){
				var lab = this.result.shorten(bindings[i][ordered_headings[j]]);
				if(lab == "unknown") lab = "";
				td.appendChild(document.createTextNode(lab));
			}
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	tab.appendChild(tbody);
	return tab;
}
