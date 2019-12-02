const TerminusClient = require('@terminusdb/terminus-client');
const DatatypeRenderers = require("./DatatypeRenderers");

function WOQLTable(client, config){
	this.client = client;
	if(config) this.options(config);
	return this;
}

WOQLTable.prototype.setResult = function(res){
	this.result = res;
	return this;
}

WOQLTable.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLTable.prototype.render = function(onChangeQuery){
	if(this.renderer) return this.renderer.render(this, onChangeQuery);
}

WOQLTable.prototype.count = function(){
	return this.result.count();
}

WOQLTable.prototype.first = function(){
	return this.result.first();
}

WOQLTable.prototype.prev = function(){
	return this.result.prev();
}

WOQLTable.prototype.next = function(){
	return this.result.next();
}


WOQLTable.prototype.options = function(config){
	this.config = config || TerminusClient.WOQL.table();	
	return this;
}

WOQLTable.prototype.setDatatypes = function(func){
	this.datatypes = new DatatypeRenderers();
	if(this.config.datatypes) this.datatypes.options(this.config.datatypes);
	if(func) func(this.datatypes);
	return this;
}

WOQLTable.prototype.canAdvancePage = function(){
	return (this.result.count() == this.result.query.getLimit()); 
}

WOQLTable.prototype.canChangePage = function(){
	return this.canAdvancePage() || this.canRetreatPage();
}

WOQLTable.prototype.canRetreatPage = function(){
	return (this.result.query.getPage() > 1);
}

WOQLTable.prototype.getPageSize = function(){
	return this.result.query.getLimit() ;	
}

WOQLTable.prototype.setPage = function(l){
	return this.result.query.setPage(l);	
}


WOQLTable.prototype.getPage = function(){
	return this.result.query.getPage();	
}

WOQLTable.prototype.setPageSize = function(l){
	return this.update(this.result.query.setPageSize(l));
}

WOQLTable.prototype.nextPage = function(){
	return this.update(this.result.query.nextPage());
}

WOQLTable.prototype.firstPage = function(){
	return this.update(this.result.query.firstPage());
}

WOQLTable.prototype.previousPage = function(){
	return this.update(this.result.query.previousPage());
}

WOQLTable.prototype.getColumnsToRender = function(){
	if(this.hasColumnOrder()){
		var cols = this.getColumnOrder();
	}
	else if(this.result.query.hasSelect()){
		var cols = this.result.query.getSelectVariables();
	}
	else {
		var cols = this.result.getVariableList();
	}
	var self = this;
	return cols.filter(col => !self.hidden(col));
}

WOQLTable.prototype.getColumnHeaderContents = function(colid){
	let hr = this.config.getMatchingRules(false, colid, "column", "header");
	if(hr && hr.length){
		let h = hr[hr.length-1].header;
		if(typeof h == "string"){
			return document.createTextNode(h);			
		}
		else if(typeof h == "function"){
			return h(colid);
		}
		else return h;
	}
	if(colid.indexOf("v:") === 0) colid = colid.substring(2);
	var clab = (colid.indexOf("http") != -1) ? TerminusClient.FrameHelper.labelFromURL(colid) : colid;
	clab = clab.replace("_", " ");
	return document.createTextNode(clab);
}


WOQLTable.prototype.hidden = function(col){
	const matched_rules = this.config.getMatchingRules(false, col, "column", "hidden");
	if(matched_rules.length){
		return matched_rules[matched_rules.length-1].hidden;
	}
	return false;
}

/**
 * Called when you want to change the query associated with the table. 
 */
WOQLTable.prototype.update = function(nquery){
	return nquery.execute(this.client).then((results) => {
		var nresult = new TerminusClient.WOQLResult(results, nquery);
		this.setResult(nresult);
		if(this.notify) this.notify(nresult);
		return nresult;
	});	
}

WOQLTable.prototype.hasDefinedEvent = function(row, key, context, action){
	const matched_rules = this.config.getMatchingRules(row, key, context, action);
	if(matched_rules && matched_rules.length) return true;
	return false;
}

WOQLTable.prototype.getDefinedEvent = function(row, key, context, action){
	const matched_rules = this.config.getMatchingRules(row, key, context, action);
	if(matched_rules && matched_rules.length) {
		var l = (matched_rules.length - 1);
		return matched_rules[l][action];
	}
}


WOQLTable.prototype.getRowClick = function(row){
	let re = this.getDefinedEvent(row, false, "row", "click");
	return re;
}

WOQLTable.prototype.getCellClick = function(row, col){
	let cc = this.getDefinedEvent(row, col, "column", "click");
	return cc;
}

WOQLTable.prototype.getRowHover = function(row){
	return this.getDefinedEvent(row, false, "row", "hover");
}

WOQLTable.prototype.getCellHover = function(row, key){
	return this.getDefinedEvent(row, key, "column", "hover");
}

WOQLTable.prototype.getColumnOrder = function(){
	return this.config.column_order();
}

WOQLTable.prototype.hasColumnOrder = WOQLTable.prototype.getColumnOrder;
WOQLTable.prototype.hasCellClick = WOQLTable.prototype.getCellClick;
WOQLTable.prototype.hasRowClick = WOQLTable.prototype.getRowClick;
WOQLTable.prototype.hasCellHover = WOQLTable.prototype.getCellHover;
WOQLTable.prototype.hasRowHover = WOQLTable.prototype.getRowHover;

WOQLTable.prototype.getRenderer = function(key, row){
	var rend = this.getSpecificRender(key, row);
	if(rend) return rend;
	let renderer = this.getDefinedEvent(row, key, "column", "renderer");
	let args =  this.getDefinedEvent(row, key, "column", "args");
	if(!renderer){
		let r = this.getRendererForDatatype(row[key]);
		renderer = r.name;
		if(!args) args = r.args;
	}
	if(renderer){
		return this.datatypes.createRenderer(renderer, args);		
	}
}

WOQLTable.prototype.renderValue = function(renderer, val, key, row){
	if(val && val['@type']){
		renderer.type = val['@type'];
		var dv = new DataValue(val['@value'], val['@type'], key, row);
	}	
	else if(val && val['@language']){
		renderer.type = "xsd:string";
		var dv = new DataValue(val['@value'], renderer.type, key, row);
	}
	else if(val && typeof val == "string"){
		renderer.type = "id";
		var dv = new DataValue(val['@value'], "id", key, row);
	}
	if(dv) return renderer.renderValue(dv);
}

function DataValue(val, type){
	this.datavalue = val;
	this.datatype = type;
}

DataValue.prototype.value = function(nvalue){
	if(nvalue) {
		this.datavalue = nvalue; 
		return this;
	}
	return this.datavalue;
}


WOQLTable.prototype.getRendererForDatatype = function(val){
	if(val && val['@type']){
		return this.datatypes.getRenderer(val['@type'], val['@value']);
	}
	else if(val && val['@language']){
		return this.datatypes.getRenderer("xsd:string", val['@value']);
	}
	else if(val && typeof val == "string"){
		return this.datatypes.getRenderer("id", val);		
	}
	return false;
}

WOQLTable.prototype.getSpecificRender = function(key, row){
	let rend = this.getDefinedEvent(row, key, "column", "render");
	return rend;
}

module.exports = WOQLTable;