const HTMLHelper = require('../HTMLHelper');

function SimpleTable(){
	this.holder = document.createElement("div");
	this.holder.setAttribute('class', 'terminus-simple-table-holder')
}

SimpleTable.prototype.options = function(options){
	for(var k in options){
		this[k] = options[k];
	}
	return this;
}


SimpleTable.prototype.render = function(woqltable){
	if(woqltable) this.woqltable = woqltable;
	HTMLHelper.removeChildren(this.holder);
	var ctls = this.getControlsDOM();
	var tab = this.getTableDOM();
	if(ctls) this.holder.appendChild(ctls)
	this.holder.appendChild(tab);
	return this.holder;
}

SimpleTable.prototype.getControlsDOM = function(result){
	var ctrls = document.createElement("span");
	if(this.woqltable.config.pager()){
		var paging = this.getPaging(result);
		if(paging) ctrls.appendChild(paging);
	}
	return ctrls;
}

SimpleTable.prototype.getTableDOM = function(){
	const columns = this.woqltable.getColumnsToRender();
	var tab = document.createElement("table");
	tab.setAttribute("class", "terminus-hover-table terminus-simple-table");
	var thead = this.getTableHeader(columns);
	tab.appendChild(thead);
	var tbody = this.getTableBody(columns);
	tab.appendChild(tbody);
	return tab;
}

SimpleTable.prototype.getTableHeader = function(cols){
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	for(var i = 0; i<cols.length; i++){
		var th = this.getColumnHeader(cols[i]);
		thr.appendChild(th);
	}
	thead.appendChild(thr);
	return thead;
}

SimpleTable.prototype.getColumnHeader = function(colid){
	var th = document.createElement("th");
	th.setAttribute('class', 'terminus-table-header-full-css');
	var clab = this.woqltable.getColumnHeaderContents(colid);
	th.appendChild(clab);
	return th;
}

SimpleTable.prototype.getTableBody = function(cols){
	var tbody = document.createElement("tbody");
	while(row = this.woqltable.next()){
		var tr = this.getHTMLRow(row, cols);
		if(tr) tbody.appendChild(tr);
	}
	return tbody;
}

SimpleTable.prototype.getHTMLRow = function(row, cols){
	var tr = document.createElement("tr");
	for(var i = 0; i<cols.length; i++){
		var td = this.getCell(cols[i], row);
		tr.appendChild(td);
	}
	var self = this;
	if(this.woqltable.hasRowClick(row)){
		var rc = this.woqltable.getRowClick(row);
		tr.addEventListener("click", function(){
			rc(row);
		});
		tr.addEventListener("mouseover", function(){
			this.style.cursor = "pointer";
		});
	}
	if(this.woqltable.hasRowHover(row)){
		var rc = this.woqltable.getRowHover(row);
		tr.addEventListener("mouseover", function(){
			rc(row);
		});
	}
	return tr;
}

SimpleTable.prototype.getCell = function(key, row){
	var td = document.createElement("td");
	if(this.woqltable.hasCellClick(row, key)){
		var rc = this.woqltable.getCellClick(row, key);
		td.addEventListener("click", function(){
			rc(row);
		});
		td.addEventListener("mouseover", function(){
			this.style.cursor = "pointer";
		});
	}
	if(this.woqltable.hasCellHover(row, key)){
		var rc = this.woqltable.getCellHover(row, key);
		tr.addEventListener("mouseover", function(){
			rc(row);
		});
	}
	var c = this.getCellData(key, row);
	if(c) td.appendChild(c);
	return td;
}

SimpleTable.prototype.getCellData = function(key, row){
	var renderer = this.woqltable.getRenderer(key, row);
	if(renderer && typeof renderer == "function"){
		return renderer(row[key], key, row);
	}
	else if(renderer && typeof renderer == "object"){
		return this.woqltable.renderValue(renderer, row[key], key, row);
	}
	var val = row[key]
	if(val && val['@value']) val = val['@value'];
	return document.createTextNode(val);
}

SimpleTable.prototype.getPaging = function(){
	if(this.woqltable.result.query.isPaged()){
		var pdom = document.createElement("div");
		pdom.setAttribute("class", "table-page-size");
		if(this.woqltable.config.pagesize()){
			let psdom = this.getPageSize();
			if(psdom) pdom.appendChild(psdom);
		}
		if(this.woqltable.canChangePage()){
			var pn = this.woqltable.result.query.getPage();
			if(pn > 2){
				pdom.appendChild(this.getFirst());
			}
			if(pn > 1){
				pdom.appendChild(this.getPrev(pn));
			}
			if(this.woqltable.config.page()) pdom.appendChild(this.getPageNumber(pn));
			pdom.appendChild(this.getNext(this.woqltable.result));
		}
		return pdom;
	}
}

SimpleTable.prototype.showPaging = function(){
	if(this.woqltable.result.query.isPaged() && this.woqltable.config.pager() && this.woqltable.canChangePage()) return true;
	return false;
}


SimpleTable.prototype.getPageSize = function(){
	if(this.showPaging()){
		var chunk = document.createElement("span");
		chunk.setAttribute("class", "woql-table-pagesize");
		clabel = document.createElement("span");
		clabel.appendChild(document.createTextNode("Page Size"));
		chunk.appendChild(clabel);
		if(this.woqltable.config.change_pagesize){
			var ctl = document.createElement("input");
			ctl.setAttribute("size", 6);
			var self = this;
			ctl.value = this.woqltable.getPageSize();
			ctl.addEventListener("blur", function(){
				var pval = (this.value ? parseInt(this.value) : false);
				self.woqltable.setPageSize(pval);
			});
			chunk.appendChild(ctl);
		}
		else {
			chunk.appendChild(document.createTextNode(this.woqltable.getPageSize()));
		}
		return chunk;
	}
	return false;
}

SimpleTable.prototype.getPageNumber = function(){
	var ctl = document.createElement("input");
	ctl.setAttribute("size", 4);
	ctl.value = this.woqltable.result.query.getPage();
	var self = this;
	ctl.addEventListener("blur", function(){
		var pval = (this.value ? parseInt(this.value) : false);
		self.woqltable.setPage(pval);
	});
	return ctl;
}

SimpleTable.prototype.getNext = function(result){
	var ctl = document.createElement("button");
	var self = this;
	ctl.appendChild(document.createTextNode("next"));
	if(!this.woqltable.canAdvancePage(result)){
		ctl.setAttribute("disabled", "disabled");
	}
	else {
		ctl.addEventListener("click", function(){
			self.woqltable.nextPage();
		});
	}
	return ctl;
}

SimpleTable.prototype.getPrev = function(result){
	var ctl = document.createElement("button");
	ctl.appendChild(document.createTextNode("previous"));
	var self = this;
	if(!this.woqltable.canRetreatPage(result)){
		ctl.setAttribute("disabled", "disabled");
	}
	else {
		ctl.addEventListener("click", function(){
			self.woqltable.previousPage();
		});
	}
	return ctl;
}

SimpleTable.prototype.getFirst = function(result){
	var ctl = document.createElement("button");
	ctl.appendChild(document.createTextNode("first"));
	var self = this;
	if(!this.woqltable.canRetreatPage(result) || this.woqltable.getPage() <= 2){
		ctl.setAttribute("disabled", "disabled");
	}
	else {
		ctl.addEventListener("click", function(){
			self.woqltable.firstPage();
		});
	}
	return ctl;
}

module.exports = SimpleTable;
