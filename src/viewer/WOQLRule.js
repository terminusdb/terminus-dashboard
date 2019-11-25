const TerminusClient = require('@terminusdb/terminus-client');
const WOQLChooser = require("./WOQLChooser");
const WOQLTable = require("./WOQLTable");
const WOQLQueryViewer = require("./WOQLQueryView");
const WOQLGraph = require("./WOQLGraph");
const WOQLStream = require("./WOQLStream");
const TerminusFrame = require("./TerminusFrame");

TerminusClient.WOQL.table = function(){ return new WOQLTableConfig(); }
TerminusClient.WOQL.graph = function(){ return new WOQLGraphConfig(); }
TerminusClient.WOQL.chooser = function(){ return new WOQLChooserConfig(); }
TerminusClient.WOQL.stream = function(){ return new WOQLStreamConfig(); }
TerminusClient.WOQL.document = function(){ return new FrameConfig(); }
//the below are aspirational...
//TerminusClient.WOQL.map = function(){ return new WOQLMapConfig(); }
//TerminusClient.WOQL.chart = function(){ return new WOQLChartConfig(); }

//Class for expressing and matching rules about WOQL results
//especially for efficiently expressing rules about how they should be rendered
//const TerminusClient = require('@terminusdb/terminus-client');

function FrameConfig(){
	this.rules = [];
}

FrameConfig.prototype.create = function(client, renderers){
	var tf = new TerminusFrame(client, this);
	if(this.trenderer) tf.setRenderer(this.trenderer);
	else if(renderers && renderers['frame']){
		tf.setRenderer(renderers['frame']);
	}
	return tf;
}

FrameConfig.prototype.renderer = function(rend){
	if(typeof rend == "undefined") return this.trenderer;
	this.trenderer = rend;
	return this;
}

FrameConfig.prototype.json_rules = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	return jr;
}

FrameConfig.prototype.load_schema = function(tf){
	if(typeof tf == "undefined") return this.get_schema;
	this.get_schema = tf;
	return this;
}

FrameConfig.prototype.show_all = function(r){
	this.all().renderer(r);
	return this;
}

FrameConfig.prototype.show_parts = function(o, p, d){
	this.object().renderer(o);
	this.property().renderer(p);
	this.data().renderer(d);
	return this;
}

FrameConfig.prototype.object = function(){
	let fp = TerminusClient.WOQL.rule();
	fp.scope("object")
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.property = function(){
	let fp = TerminusClient.WOQL.rule();
	fp.scope("property");
	this.rules.push(fp);
	return fp;	
}

FrameConfig.prototype.data = function(){
	let fp = TerminusClient.WOQL.rule();
	fp.scope("data")
	this.rules.push(fp);
	return fp;	
}

FrameConfig.prototype.all = function(){
	let fp = TerminusClient.WOQL.rule();
	fp.scope("*")
	this.rules.push(fp);
	return fp;	
}


FrameConfig.prototype.setFrameDisplayOptions = function(frame, rule){
	if(typeof frame.display_options == "undefined") frame.display_options = {};
	if(typeof rule.mode() != "undefined") frame.display_options.mode = rule.mode();
	if(typeof rule.view() != "undefined") frame.display_options.view = rule.view();
	//if(typeof rule.facets() != "undefined") frame.display_options.facets = rule.facets();
	//if(typeof rule.facet() != "undefined") frame.display_options.facet = rule.facet();
	if(typeof rule.show_disabled_buttons() != "undefined") frame.display_options.show_disabled_buttons = rule.hide_disabled_buttons();
	if(typeof rule.features() != "undefined") frame.display_options.features = rule.features();
	if(typeof rule.header() != "undefined") frame.display_options.header = rule.header();
	if(typeof rule.hidden() != "undefined") frame.display_options.hidden = rule.hidden();
	if(typeof rule.collapse() != "undefined") frame.display_options.collapse = rule.collapse();
	if(typeof rule.header_features() != "undefined") frame.display_options.header_features = rule.header_features();
	if(typeof rule.show_empty() != "undefined") frame.display_options.show_empty = rule.show_empty();
	if(typeof rule.feature_renderers() != "undefined") frame.display_options.feature_renderers = rule.feature_renderers();
	if(typeof rule.dataviewer() != "undefined") {
		frame.display_options.dataviewer = rule.dataviewer();
		if(typeof rule.dataviewer_options() != "undefined")
			frame.display_options.dataviewer_options = rule.dataviewer_options();
	}
}	



//WOQL.rule().renderer("object").json(),
//WOQL.rule().renderer("property").json(),
//WOQL.rule().renderer("data").json(),
//WOQL.rule().renderer("data").property("rdfs:comment").render(false).json()


function WOQLStreamConfig(){
	this.rules = [];
}

WOQLStreamConfig.prototype.getMatchingRules = function(row, key, context, action){
	return getMatchingRules(this.rules, row, key, context, action);
}

WOQLStreamConfig.prototype.create = function(client, renderers){
	var wqt = new WOQLStream(client, this);
	if(this.trenderer) wqt.setRenderer(this.trenderer);
	else if(renderers && renderers['stream']){
		wqt.setRenderer(renderers['stream']);
	}
	return wqt;
}


function WOQLChooserConfig(){
	this.rules = [];
}

WOQLChooserConfig.prototype.getMatchingRules = function(row, key, context, action){
	return getMatchingRules(this.rules, row, key, context, action);
}

WOQLChooserConfig.prototype.create = function(client, renderers){
	var wqt = new WOQLChooser(client, this);
	if(this.trenderer) wqt.setRenderer(this.trenderer);
	else if(renderers && renderers['chooser']){
		wqt.setRenderer(renderers['chooser']);
	}
	return wqt;
}

WOQLChooserConfig.prototype.change = function(v){
	if(typeof v != "undefined"){
		this.onChange = v;
		return this;
	}
	return this.onChange;	
}

WOQLChooserConfig.prototype.show_empty = function(p){
	if(typeof p != "undefined"){
		this.placeholder = p;
		return this;
	}
	return this.placeholder;	
}


WOQLChooserConfig.prototype.rule = function(v){
	let nr = new WOQLRule("row");
	this.rules.push(nr);
	return nr.v(v);	
}

WOQLChooserConfig.prototype.values = function(v){
	if(typeof v != "undefined"){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.value_variable = v;
		return this;
	}
	return this.value_variable;
}

WOQLChooserConfig.prototype.labels = function(v){
	if(v){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.label_variable = v;
		return this;
	}
	return this.label_variable;
}

WOQLChooserConfig.prototype.titles = function(v){
	if(v){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.title_variable = v;
		return this;
	}
	return this.title_variable;
}

WOQLChooserConfig.prototype.sort = function(v){
	if(v){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.sort_variable = v;
		return this;
	}
	return this.sort_variable;
}

WOQLChooserConfig.prototype.direction = function(v){
	if(v){
		this.sort_direction = v;
		return this;
	}
	return this.sort_direction;
}


//this.choice = (config && config.choice ? config.choice : false);


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
	if(typeof val == "undefined" || val.length == 0){
		return this.order;
	}
	this.order = addNamespacesToVariables(val);
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

WOQLGraphConfig.prototype.getMatchingRules = function(row, key, context, action){
	return getMatchingRules(this.rules, row, key, context, action);
}

WOQLGraphConfig.prototype.literals = function(v){
	if(typeof v != "undefined"){
		this.show_literals = v;
		return this;
	}
	return this.show_literals;
}

WOQLGraphConfig.prototype.source = function(v){
	if(v){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.source_variable = v;
		return this;
	}
	return this.source_variable;
}

WOQLGraphConfig.prototype.fontfamily = function(v){
	if(typeof v != "undefined"){
		this.fontfam = v;
		return this;
	}
	return this.fontfam;
}

WOQLGraphConfig.prototype.show_force = function(v){
	if(typeof v != "undefined"){
		this.force = v;
		return this;
	}
	return this.force;
}

WOQLGraphConfig.prototype.fix_nodes = function(v){
	if(typeof v != "undefined"){
		this.fixed = v;
		return this;
	}
	return this.fixed;
}

WOQLGraphConfig.prototype.explode_out = function(v){
	if(typeof v != "undefined"){
		this.explode = v;
		return this;
	}
	return this.explode;
}

WOQLGraphConfig.prototype.width = function(v){
	if(typeof v != "undefined"){
		this.gwidth = v;
		return this;
	}
	return this.gwidth;
}

WOQLGraphConfig.prototype.height = function(v){
	if(typeof v != "undefined"){
		this.gheight = v;
		return this;
	}
	return this.gheight;
}

WOQLGraphConfig.prototype.selected_grows = function(v){
	if(typeof v != "undefined"){
		this.bigsel = v;
		return this;
	}
	return this.bigsel;
}

WOQLGraphConfig.prototype.node = function(...cols){
	let nr = new WOQLRule("node");
	nr.setVariables(cols);
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig.prototype.edge = function(source, target){
	let nr = new WOQLRule("edge");
	if(source && target) nr.setVariables([source, target]);
	else if(source) nr.setVariables([source]);
	else if(target) nr.setVariables([target]);
	if(source) nr.source = source;
	if(target) nr.target = target;
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig.prototype.edges = function(...edges){
	if(edges && edges.length){
		var nedges = [];
		for(var i = 0; i<edges.length; i++){
			nedges.push(addNamespacesToVariables(edges[i]));
		}
		this.show_edges = nedges;
		return this;
	}
	return this.show_edges;
}

function WOQLRule(s){
	this.rule = { scope: s };
}

WOQLRule.prototype.size = function(size){
	if(typeof size == "undefined"){
		return this.rule.size;
	}
	this.rule.size = size;
	return this;
}

WOQLRule.prototype.color = function(color){
	if(typeof color == "undefined"){
		return this.rule.color;
	}
	this.rule.color = color;
	return this;
}

WOQLRule.prototype.charge = function(v){
	if(typeof v == "undefined"){
		return this.rule.charge;
	}
	this.rule.charge = v;
	return this;
}

WOQLRule.prototype.collisionRadius = function(v){
	if(typeof v == "undefined"){
		return this.rule.collisionRadius;
	}
	this.rule.collisionRadius = v;
	return this;
}

WOQLRule.prototype.icon = function(json){
	if(json){
		this.rule.icon = json;
		return this;
	}
	return this.rule.icon;
}

WOQLRule.prototype.text = function(json){
	if(json){
		this.rule.text = json;
		return this;
	}
	return this.rule.text;
}

WOQLRule.prototype.border = function(json){
	if(json){
		this.rule.border = json;
		return this;
	}
	return this.rule.border;
}

WOQLRule.prototype.arrow = function(json){
	if(json){
		this.rule.arrow = json;
		return this;
	}
	return this.rule.arrow;
}

WOQLRule.prototype.distance = function(d){
	if(typeof d != "undefined"){
		this.rule.distance = d;
		return this;
	}
	return this.rule.distance;
}

WOQLRule.prototype.symmetric = function(d){
	if(typeof d != "undefined"){
		this.rule.symmetric = d;
		return this;
	}
	return this.rule.symmetric ;
}


WOQLRule.prototype.weight = function(w){
	if(typeof w != "undefined"){
		this.rule.weight = w;
		return this;
	}
	return this.rule.weight;
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

WOQLRule.prototype.literal = function(tf){
	this.rule.literal = tf;
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

WOQLRule.prototype.label = function(l){
	if(l){
		this.rule.label = l;
		return this;
	}
	return this.rule.label;
}

WOQLRule.prototype.title = function(l){
	if(l){
		this.rule.title = l;
		return this;
	}
	return this.rule.title;
}

WOQLRule.prototype.selected = function(s){
	if(typeof s != "undefined"){
		this.rule.selected = s;
		return this;
	}
	return this.rule.selected;
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
			if(typeof key == "object"){
				if(this.rule.variables.indexOf(key[0]) == -1) return false;
				if(this.rule.variables.indexOf(key[1]) == -1) return false;
			}
			else if(this.rule.variables.indexOf(key) == -1) return false;
		}
		if(this.rule && this.rule.type){
			if(typeof key == "object"){
				if(!(data[key][0]["@type"] && this.rule.type.indexOf(data[key][0]["@type"]) != -1)){
					return false;
				}
			}
			else if(!(data[key]["@type"] && this.rule.type.indexOf(data[key]["@type"]) != -1)){
				return false;
			}
		}
		if(this.rule && typeof this.rule.literal != "undefined"){
			if(typeof key == "object"){
				if(data[key[0]]['@value']) {
					if(!this.rule.literal) return false; 
				}
				else if(this.rule.literal) return false;
			}
			else {
				if(data[key]['@value']) {
					if(!this.rule.literal) return false; 
				}
				else if(this.rule.literal) return false;
			}
		}
		if(typeof key == "object"){
			if(this.rule.constraints && this.rule.constraints[key[0]]){
				for(var i = 0; i<this.rule.constraints[key[0]].length; i++){
					if(!this.test(row[key[0]], this.rule.constraints[key][0])){
						return false;
					}
				}			
			}
			if(this.rule.constraints && this.rule.constraints[key[1]]){
				for(var i = 0; i<this.rule.constraints[key[1]].length; i++){
					if(!this.test(row[key[1]], this.rule.constraints[key][1])){
						return false;
					}
				}			
			}
		}
		else if(this.rule.constraints && this.rule.constraints[key]){
			for(var i = 0; i<this.rule.constraints[key].length; i++){
				if(!this.test(row[key], this.rule.constraints[key])){
					return false;
				}
			}			
		}
		if(context == "edge"){
			if(this.rule.source && this.rule.source != key[0]) return false;
			if(this.rule.target && this.rule.target != key[1]) return false;
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


