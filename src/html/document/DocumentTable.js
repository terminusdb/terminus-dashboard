function DocumentTable(){}

DocumentTable.prototype.render = function(frame){
	var t = this.getTableDOM(frame);
	var tbody = document.createElement("tbody");
	for(var p in frame.properties){
		//s.appendChild(document.createTextNode(p));
		var pr = this.renderProperty(tbody, frame.properties[p]);
		//if(pr) tbody.appendChild(pr);
	}
	t.appendChild(tbody);
	return t;
}

DocumentTable.prototype.getTableDOM = function(frame){
	//const columns = this.woqltable.getColumnsToRender();
	var tab = document.createElement("table");
	tab.setAttribute("class", "terminus-hover-table");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var th = document.createElement("th");
	th.setAttribute('class', 'terminus-table-header-full-css');
	th.setAttribute('colspan', 2);
	th.appendChild(document.createTextNode(frame.subject() + ", " + frame.subjectClass()));
	thr.appendChild(th);
	thead.appendChild(thr);	
	tab.appendChild(thead);
	return tab;
}

DocumentTable.prototype.renderProperty = function(tbody, frame){
	for(var i = 0 ; i < frame.values.length; i++){
		var thr = document.createElement("tr");
		var td = document.createElement("td");
		td.appendChild(document.createTextNode(frame.getLabel()));
		var td2 = document.createElement("td");
		if(frame.values[i].isData()){
			td2.appendChild(this.renderValue(frame.values[i]));
		}
		else {
			td2.appendChild(this.render(frame.values[i]));			
		}
		thr.appendChild(td);	
		thr.appendChild(td2);	
		tbody.appendChild(thr);	
	}
}

DocumentTable.prototype.renderValue = function(frame){
	return document.createTextNode(frame.get());
}

module.exports = DocumentTable;