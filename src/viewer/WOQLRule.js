const TerminusClient = require('@terminusdb/terminus-client');
const WOQLTable = require("./WOQLTable");
const WOQLChoice = require("./WOQLChooser");
const WOQLQueryViewer = require("./WOQLQueryView");
const WOQLGraph = require("./WOQLGraph");
const WOQLStream = require("./WOQLStream");

TerminusClient.WOQL.table = function(t){ return new WOQLTableConfig(t); }
TerminusClient.WOQL.graph = function(t){ return new WOQLGraphConfig(t); }
TerminusClient.WOQL.chooser = function(c){ return new WOQLChooserConfig(t); }
TerminusClient.WOQL.stream = function(s){ return new WOQLStreamConfig(t); }


//Class for expressing and matching rules about WOQL results
//especially for efficiently expressing rules about how they should be rendered
//const TerminusClient = require('@terminusdb/terminus-client');

function WOQLTableConfig(){
	this.rules = [];
	this.show_pager = true;
	this.show_pagesize = true;	
	this.change_pagesize = true;
	this.show_pagenumber = true;

}

WOQLTableConfig.prototype.getMatchingRules = function(row, key, context, action){
	return getMatchingRules(this.rules, row, key, context, action);
}

WOQLTableConfig.prototype.create = function(client, renderers, dtypes){
	var wqt = new WOQLTable(client, this);
	wqt.setDatatypes(dtypes);
	if(this.trenderer) wqt.setRenderer(this.trenderer);
	else if(renderers && renderers['table']){
		wqt.setRenderer(renderers['table']);
	}
	return wqt;
}

WOQLTableConfig.prototype.renderer = function(rend){
	this.trenderer = rend;
	return this;
}

WOQLTableConfig.prototype.column_order = function(...val){
	if(typeof val == "undefined"){
		return this.column_order;
	}
	this.column_order = addNamespacesToVariables(val);
	return this;		
}

WOQLTableConfig.prototype.pager = function(val){
	if(typeof val == "undefined"){
		return this.show_pager;
	}
	this.show_pager = val;
	return this;	
}

WOQLTableConfig.prototype.pagesize = function(val, editable){
	if(typeof val == "undefined"){
		return this.show_pagesize;
	}
	this.show_pagesize = val;	
	this.change_pagesize = editable;
	return this;
}

WOQLTableConfig.prototype.page = function(val){
	if(typeof val == "undefined"){
		return this.show_pagenumber;
	}
	this.show_pagenumber = val;
	return this;
}

WOQLTableConfig.prototype.column = function(...cols){
	let nr = new WOQLRule("column");
	nr.setVariables(cols);
	this.rules.push(nr);
	return nr;
}

/* shorthand alternative */
WOQLTableConfig.prototype.col = WOQLTableConfig.prototype.column; 


WOQLTableConfig.prototype.row = function(){
	let nr = new WOQLRule("row");
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig = function(){
	this.rules = [];	
}

WOQLGraphConfig.prototype.create = function(client, renderers){
	var wqt = new WOQLGraph(client, this);
	if(this.trenderer) wqt.setRenderer(this.trenderer);
	else if(renderers && renderers['graph']){
		wqt.setRenderer(renderers['graph']);
	}
	return wqt;
}

function WOQLRule(s){
	this.rule = { scope: s };
}

WOQLRule.prototype.renderer = function(rend){
	if(typeof rend == "undefined"){
		return this.rule.renderer;
	}
	this.rule.renderer = rend;
	return this;
}

WOQLRule.prototype.header = function(hdr){
	if(typeof hdr == "undefined"){
		return this.rule.header;
	}
	this.rule.header = hdr;
	return this;
}


WOQLRule.prototype.render = function(func){
	if(typeof func == "undefined"){
		return this.rule.render;
	}
	this.rule.render = func;
	return this;
}

WOQLRule.prototype.click = function(onClick){
	if(onClick){
		this.rule.click = onClick;
		return this;
	}
	return this.rule.click;
}

WOQLRule.prototype.hover = function(onHover){
	if(onHover){
		this.rule.hover = onHover;
		return this;
	}
	return this.rule.hover;
}

WOQLRule.prototype.hidden = function(hidden){
	if(typeof hidden == "undefined"){
		return this.rule.hidden;
	}
	this.rule.hidden = hidden;
	return this;
}

WOQLRule.prototype.args = function(args){
	this.rule.args = args;
	return this;
}


WOQLRule.prototype.type = function(...list){
	this.rule.type = list;
	return this;
}

WOQLRule.prototype.setVariables = function(vars){
	if(vars && vars.length){
		this.rule.variables = addNamespacesToVariables(vars);
		this.current_variable = this.rule.variables[this.rule.variables.length - 1];
	}
	return this;
}

WOQLRule.prototype.v = function(v){
	if(v){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.current_variable = v;
		return this;
	}
	return this.current_variable;
}

WOQLRule.prototype.in = function(...list){
	if(this.current_variable){
		if(!this.rule.constraints) this.rule.constraints = {};
		if(!this.rule.constraints[this.current_variable]) this.rule.constraints[this.current_variable] = [];
		this.rule.constraints[this.current_variable].push(list);
	}
	return this;
}

WOQLRule.prototype.filter = function(tester){
	if(this.current_variable){
		if(!this.rule.constraints) this.rule.constraints = {};
		if(!this.rule.constraints[this.current_variable]) this.rule.constraints[this.current_variable] = [];
		this.rule.constraints[this.current_variable].push(tester);
	}
	return this;
}

/*
 * Matches on
 * 1. scope (row, cell, column)
 * 2. variables - only match certain ones
 * 3. type - only match datatype
 * 4. constraints - on values of variables
 */

WOQLRule.prototype.match = function(data, key, context, action){
	if(context && this.rule.scope != context) return false;
	if(key){
		if(this.rule.variables && this.rule.variables.length){
			 if(this.rule.variables.indexOf(key) == -1) return false;
		}
		if(this.rule && this.rule.type){
			if(!(data[key]["@type"] && this.rule.type.indexOf(data[key]["@type"]) != -1)){
				return false;
			}
		}
		if(this.rule.constraints && this.rule.constraints[key]){
			for(var i = 0; i<this.rule.constraints[key].length; i++){
				if(!this.test(row[key], this.rule.constraints[key])){
					return false;
				}
			}			
		}
	}
	else {
		for(var k in this.rule.constraints){
			for(var i = 0; i<this.rule.constraints[k].length; i++){
				if(!this.test(data[k], this.rule.constraints[k])){
					return false;
				}
			}						
		}
	}
	if(action && typeof this.rule[action] == "undefined") return false;
	return true;
}

WOQLRule.prototype.test = function(value, constraint){
	if(typeof constraint == "object" && constraint.length){
		var vundertest = (value['@value'] ? value['@value'] : value);
		return (constraint.indexOf(vundertest) != -1);
	}
	if(typeof constraint == "function"){
		return constraint(value);
	}	
}


/*
 * [
	WOQL.column("ID", "Class", "Type_Comment").hidden(true);
	WOQL.column("Label").header("Document").renderer(func);
	WOQL.column("Type").renderer(func);
	WOQL.column("Comment").header("Description").renderer("HTMLStringViewer").args({max_cell_size: 40, max_word_size: 10});
	WOQL.row().v("ID").in("a", "b", "c").hover(func);
	WOQL.cell("ID").in("a", "b", "c").hover(func);
	WOQL.cell().type("xsd:date").hover(func);
	]
*/

function WOQLGraphConfig(){
	this.rules = [];	
}

WOQLGraphConfig.prototype.edge = function(s, e, t){
}

WOQLGraphConfig.prototype.node = function(s, e, t){
}

/*
 * 
 */

function WOQLChooserConfig(){
	this.rules = [];
}

function WOQLStreamConfig(){
	this.rules = [];
}






WOQLRule.prototype.edge = function(){
	this.rule_scope = "edge";
	return this;
}

WOQLRule.prototype.weight = function(w){
	this.rule.weight = w;
	return this;
}


function WOQLPatternMatcher(){}

WOQLPatternMatcher.prototype.loadRules = function(rules){
	this.rules = rules;
}



/*
 * Utility function adds v: to variables...
 */
function addNamespacesToVariables(vars){
	var nvars = [];
	for(var i = 0; i<vars.length; i++){
		var nvar = (vars[i].substring(0, 2) == "v:") ? vars[i] : "v:" + vars[i];
		nvars.push(nvar);
	}	
	return nvars;
}

function getMatchingRules(rules, row, key, context, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(rules[i].match(row, key, context, action)){
			matches.push(rules[i].rule);
		}
	}	
	return matches;
}




/*
 * 
var x = WOQL.schema();
x.addClass("my:Class").label("A class").comment("A comment").abstract().relationship();
x.addProperty("my:prop", "xsd:string").domain("my:Class").label("x").comment("x").max(2).min(1);
x.execute(client).then ...
 */



/*
 * 
 * WOQLRule().row().click(rowClick).cell().click(cellClick);
[
WOQL.column("ID", "Class", "Type_Comment").hidden(true);
WOQL.column("ID", "Class", "Type_Comment").hidden(true);
WOQL.column("Label").header("Document").renderer(func);
WOQL.column("Type").renderer(func);
WOQL.column("Comment").header("Description").renderer("HTMLStringViewer").args({max_cell_size: 40, max_word_size: 10});
WOQL.value("ID").in("a", "b", "c").row().hover(func);
]
*/

//WOQL.


/*var opts = {
		"v:ID": {
			hidden: true
		},
		"v:Class": {hidden: true },
		"v:Type_Comment": {hidden: true },
		"v:Label": { 
			header: "Document", 
			renderer: function(dataviewer){
				return dataviewer.annotateValue(dataviewer.value(), 
					{ ID: dataviewer.binding('v:ID')});
			},
		},
		"v:Type": { 
			renderer: function(dataviewer){
				return dataviewer.annotateValue(dataviewer.value(), 
						{ Class: dataviewer.binding('v:Class'), Description: dataviewer.binding('v:Type_Comment')}
				);
			}
		},
		"v:Comment": {	header: "Description", renderer: "HTMLStringViewer", args: {max_cell_size: 40, max_word_size: 10} },
	}
	return opts;
*/
module.exports = WOQLPatternMatcher;