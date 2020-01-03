const TerminusClient = require('@terminusdb/terminus-client');
const WOQLChooser = require("./WOQLChooser");
const WOQLTable = require("./WOQLTable");
const WOQLGraph = require("./WOQLGraph");
const WOQLStream = require("./WOQLStream");
const TerminusFrame = require("./TerminusFrame");

TerminusClient.WOQL.table = function(){ return new WOQLTableConfig(); }
TerminusClient.WOQL.chart = function(){ return new WOQLChartConfig(); }
TerminusClient.WOQL.graph = function(){ return new WOQLGraphConfig(); }
TerminusClient.WOQL.chooser = function(){ return new WOQLChooserConfig(); }
TerminusClient.WOQL.stream = function(){ return new WOQLStreamConfig(); }
TerminusClient.WOQL.document = function(){ return new FrameConfig(); }
TerminusClient.WOQL.loadConfig = function(config){
	if(config.table){
		var view = new WOQLTableConfig();
		view.loadJSON(config.table, config.rules);
	}
	else if(config.chooser){
		var view = new WOQLChooserConfig();
		view.loadJSON(config.chooser, config.rules);
	}
	else if(config.graph){
		var view = new WOQLGraphConfig();
		view.loadJSON(config.graph, config.rules);
	}
	else if(config.stream){
		var view = new WOQLStreamConfig();
		view.loadJSON(config.stream, config.rules);
	}
	else if(config.frame){
		var view = new FrameConfig();
		view.loadJSON(config.frame, config.rules);
	}
	return view;
}
//the below are aspirational...
//TerminusClient.WOQL.map = function(){ return new WOQLMapConfig(); }
//TerminusClient.WOQL.chart = function(){ return new WOQLChartConfig(); }

//Class for expressing and matching rules about WOQL results
//especially for efficiently expressing rules about how they should be rendered
//const TerminusClient = require('@terminusdb/terminus-client');

function FrameConfig(){
	this.rules = [];
	this.type = "document";
}

FrameConfig.prototype.prettyPrint = function(){
	var str = "view = WOQL.document();\n";
	if(this.renderer()){
		str += "view.renderer('" + this.renderer() + "')\n";
	}
	if(typeof this.load_schema() != "undefined"){
		str += "view.load_schema(" + this.load_schema() + ")\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint("frame") + "\n";
	}
	return str;
}

FrameConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var conf = {};
	if(typeof this.renderer() != "undefined"){
		conf['renderer'] = this.renderer();
	}
	if(typeof this.load_schema() != "undefined"){
		conf['load_schema'] = this.load_schema();
	}
	let mj = {"frame" :conf, "rules": jr};
	return mj;
}

FrameConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new TerminusClient.WOQL.rule("frame");
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(typeof config.renderer != "undefined"){
		this.renderer(config.renderer);
	}
	if(typeof config.load_schema != "undefined"){
		this.load_schema(config.load_schema);
	}
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
	let fp = new DocumentRule("object");
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.property = function(){
	let fp = new DocumentRule("property");
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.scope = function(scope){
	let fp = new DocumentRule(scope);
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.data = function(){
	let fp = new DocumentRule("data");
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.all = function(){
	let fp = new DocumentRule("*");
	this.rules.push(fp);
	return fp;
}

/**
 * Attaches display options to frames from matching rules
 */
FrameConfig.prototype.setFrameDisplayOptions = function(frame, rule){
	if(typeof frame.display_options == "undefined") frame.display_options = {};
	if(typeof rule.mode() != "undefined") {	frame.display_options.mode = rule.mode();}
	if(typeof rule.view() != "undefined") frame.display_options.view = rule.view();
	if(typeof rule.showDisabledButtons() != "undefined") frame.display_options.show_disabled_buttons = rule.showDisabledButtons();
	if(typeof rule.hidden() != "undefined") frame.display_options.hidden = rule.hidden();
	if(typeof rule.collapse() != "undefined") frame.display_options.collapse = rule.collapse();
	if(typeof rule.style() != "undefined") frame.display_options.style = rule.style();
	if(typeof rule.headerStyle() != "undefined") frame.display_options.header_style = rule.headerStyle();
	if(typeof rule.features() != "undefined") {		frame.display_options.features = this.setFrameFeatures(frame.display_options.features, rule.features());	}
	if(typeof rule.headerFeatures() != "undefined") frame.display_options.header_features = this.setFrameFeatures(frame.display_options.header_features, rule.headerFeatures());
	if(typeof rule.header() != "undefined") frame.display_options.header = rule.header();
	if(typeof rule.showEmpty() != "undefined") frame.display_options.show_empty = rule.showEmpty();
	if(typeof rule.dataviewer() != "undefined") frame.display_options.dataviewer = rule.dataviewer();
	if(typeof rule.args() != "undefined") frame.display_options.args = this.setFrameArgs(frame.display_options.args, rule.args());
}

/*
Consolidates properties of features sent in in different rules
*/
FrameConfig.prototype.setFrameFeatures = function(existing, fresh){
	//preserve order of existing
	if(!existing || !existing.length) return fresh;
	if(!fresh || !fresh.length)  return existing;
	let got = [];
	for(var i = 0; i< existing.length; i++){
		var key = (typeof existing[i] == "string" ? existing[i] : Object.keys(existing[i])[0]);
		got.push(key);
	}
	for(var j = 0; j< fresh.length; j++){
		var fkey = (typeof fresh[j] == "string" ? fresh[j] : Object.keys(fresh[j])[0]);
		var rep = got.indexOf(fkey);
		if(rep == -1) existing.push(fresh[j]);
		else if(typeof fresh[j] == "object"){
			var val = existing[rep];
			if(typeof val == 'string') existing[rep] = fresh[j];
			else if(typeof val == 'object'){
				var props = fresh[j][fkey];
				for(var p in props){
					existing[rep][fkey][p] = props[p];
				}
			}
		}
	}
	return existing;	
}

FrameConfig.prototype.setFrameArgs = function(existing, fresh){
	if(!existing) return fresh;
	if(!fresh) return existing;
	for(var k in fresh){
		existing[k] = fresh[k];
	}
	return existing;
}


function WOQLStreamConfig(){
	this.rules = [];
	this.type = "stream";
}

WOQLStreamConfig.prototype.prettyPrint = function(){
	var str = "view = WOQL.stream();\n";
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint("stream") + "\n";
	}
	return str;
}

WOQLStreamConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLStreamRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
}


WOQLStreamConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var conf = {};
	let mj = {"stream" :conf, "rules": jr};
	return mj;
}

WOQLStreamConfig.prototype.getMatchingRules = function(row, key, context, action){
	return TerminusClient.WOQL.getMatchingRules(this.rules, row, key, context, action)
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
	this.type = "chooser";
}

WOQLChooserConfig.prototype.getMatchingRules = function(row, key, context, action){
	return TerminusClient.WOQL.getMatchingRules(this.rules, row, key, context, action)
}

WOQLChooserConfig.prototype.create = function(client, renderers){
	var wqt = new WOQLChooser(client, this);
	if(this.trenderer) wqt.setRenderer(this.trenderer);
	else if(renderers && renderers['chooser']){
		wqt.setRenderer(renderers['chooser']);
	}
	return wqt;
}

WOQLChooserConfig.prototype.prettyPrint = function(){
	var str = "view = WOQL.chooser();\n";
	if(typeof this.change() != "undefined"){
		str += "view.change(" + this.change() + ")\n";
	}
	if(typeof this.show_empty() != "undefined"){
		str += "view.show_empty('" + this.show_empty() + "')\n";
	}
	if(typeof this.values() != "undefined"){
		str += "view.values('" + TerminusClient.UTILS.removeNamespaceFromVariable(this.values()) + "')\n";
	}
	if(typeof this.labels() != "undefined"){
		str += "view.labels('" + TerminusClient.UTILS.removeNamespaceFromVariable(this.labels()) + "')\n";
	}
	if(typeof this.titles() != "undefined"){
		str += "view.titles('" + TerminusClient.UTILS.removeNamespaceFromVariable(this.titles()) + "')\n";
	}
	if(typeof this.sort() != "undefined"){
		str += "view.sort(" + this.sort() + ")\n";
	}
	if(typeof this.direction() != "undefined"){
		str += "view.direction('" + this.direction() + "')\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint("chooser") + "\n";
	}
	return str;
}

WOQLChooserConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var conf = {};
	if(typeof this.change() != "undefined"){
		conf['change'] = this.change();
	}
	if(typeof this.show_empty() != "undefined"){
		conf['show_empty'] = this.show_empty();
	}
	if(typeof this.values() != "undefined"){
		conf['values'] = this.values();
	}
	if(typeof this.labels() != "undefined"){
		conf['labels'] = this.labels();
	}
	if(typeof this.titles() != "undefined"){
		conf['titles'] = this.titles();
	}
	if(typeof this.sort() != "undefined"){
		conf['sort'] = this.sort();
	}
	if(typeof this.direction() != "undefined"){
		conf['direction'] = this.direction();
	}
	let mj = {"chooser" :conf, "rules": jr};
	return mj;
}

WOQLChooserConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLChooserRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(typeof config.change != "undefined"){
		this.change(config.change);
	}
	if(typeof config.show_empty != "undefined"){
		this.show_empty(config.show_empty);
	}
	if(typeof config.values != "undefined"){
		this.values(config.values);
	}
	if(typeof config.labels != "undefined"){
		this.labels(config.labels);
	}
	if(typeof config.titles != "undefined"){
		this.titles(config.titles);
	}
	if(typeof config.sort != "undefined"){
		this.sort(config.sort);
	}
	if(typeof config.direction != "undefined"){
		this.direction(config.direction);
	}
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
	let nr = new WOQLChooserRule("row");
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
	this.type = "table";
	this.show_pager = true;
	this.show_pagesize = true;
}

WOQLTableConfig.prototype.getMatchingRules = function(row, key, context, action){
	return TerminusClient.WOQL.getMatchingRules(this.rules, row, key, context, action)	
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

WOQLTableConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var conf = {};
	if(typeof this.column_order() != "undefined"){
		conf['column_order'] = this.column_order();
	}
	if(typeof this.pagesize() != "undefined"){
		conf['pagesize'] = this.pagesize();
	}
	if(typeof this.renderer() != "undefined"){
		conf['renderer'] = this.renderer();
	}
	if(typeof this.pager() != "undefined"){
		conf['pager'] = this.pager();
	}
	if(typeof this.page() != "undefined"){
		conf['page'] = this.page();
	}
	let mj = {"table" :conf, "rules": jr};
	return mj;
}

WOQLTableConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLTableRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(typeof config.column_order != "undefined"){
		this.column_order(config.column_order);
	}
	if(typeof config.pagesize != "undefined"){
		this.pagesize(config.pagesize);
	}
	if(typeof config.renderer != "undefined"){
		this.renderer(config.renderer);
	}
	if(typeof config.pager != "undefined"){
		this.pager(config.pager);
	}
	if(typeof config.page != "undefined"){
		this.page(config.page);
	}
}

WOQLTableConfig.prototype.prettyPrint = function(){
	var str = "view = WOQL.table();\n";
	if(typeof this.column_order() != "undefined"){
		str += "view.column_order('" + this.column_order() + "')\n";
	}
	if(typeof this.pagesize() != "undefined"){
		str += "view.pagesize(" + this.pagesize() + ")\n";
	}
	if(typeof this.renderer() != "undefined"){
		str += "view.renderer('" + this.renderer() + "')\n";
	}
	if(typeof this.pager() != "undefined"){
		str += "view.pager(" + this.pager() + ")\n";
	}
	if(typeof this.page() != "undefined"){
		str += "view.page(" + this.page() + ")\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint("table") + "\n";
	}
	return str;
}

WOQLTableConfig.prototype.renderer = function(rend){
	if(!rend) return this.trenderer;
	this.trenderer = rend;
	return this;
}

WOQLTableConfig.prototype.column_order = function(...val){
	if(typeof val == "undefined" || val.length == 0){
		return this.order;
	}
	this.order = TerminusClient.UTILS.addNamespacesToVariables(val);
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
	let nr = new WOQLTableRule("column");
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
	this.type = "graph";
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
	return TerminusClient.WOQL.getMatchingRules(this.rules, row, key, context, action);
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
	//return 'Font Awesome 5 Free';
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

WOQLGraphConfig.prototype.selected_grows = function(v){
	if(typeof v != "undefined"){
		this.bigsel = v;
		return this;
	}
	return this.bigsel;
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

WOQLGraphConfig.prototype.edges = function(...edges){
	if(edges && edges.length){
		var nedges = [];
		for(var i = 0; i<edges.length; i++){
			nedges.push(TerminusClient.UTILS.addNamespacesToVariables(edges[i]));
		}
		this.show_edges = nedges;
		return this;
	}
	return this.show_edges;
}

WOQLGraphConfig.prototype.edge = function(source, target){
	let nr = new WOQLGraphRule("edge");
	if(source && target) nr.setVariables([source, target]);
	else if(source) nr.setVariables([source]);
	else if(target) nr.setVariables([target]);
	if(source) nr.source = source;
	if(target) nr.target = target;
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig.prototype.node = function(...cols){
	let nr = new WOQLGraphRule("node");
	nr.setVariables(cols);
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig.prototype.getConfigAsJSON = function(){
	var json = {};
	if(typeof this.literals() != "undefined"){
		json['literals'] = this.literals();
	}
	if(typeof this.source() != "undefined"){
		json['source'] = this.source();
	}
	if(typeof this.fontfamily() != "undefined"){
		json['fontfamily'] = this.fontfamily();
	}
	if(typeof this.show_force() != "undefined"){
		json['show_force'] = this.show_force();
	}
	if(typeof this.fix_nodes() != "undefined"){
		json['fix_nodes'] = this.fix_nodes();
	}
	if(typeof this.explode_out() != "undefined"){
		json['explode_out'] = this.explode_out();
	}
	if(typeof this.selected_grows() != "undefined"){
		json['selected_grows'] = this.selected_grows();
	}
	if(typeof this.width() != "undefined"){
		json['width'] = this.width();
	}
	if(typeof this.height() != "undefined"){
		json['height'] = this.height();
	}
	if(typeof this.edges() != "undefined"){
		json['edges'] = this.edges();
	}
	return json;
}

WOQLGraphConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLGraphRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(typeof config.literals != "undefined"){
		this.literals(config.literals);
	}
	if(typeof config.source != "undefined"){
		this.source(config.source);
	}
	if(typeof config.fontfamily != "undefined"){
		this.fontfamily(config.fontfamily);
	}
	if(typeof config.show_force != "undefined"){
		this.show_force(config.show_force);
	}
	if(typeof config.fix_nodes != "undefined"){
		this.fix_nodes(config.showfix_nodes_force);
	}
	if(typeof config.explode_out != "undefined"){
		this.explode_out(config.explode_out);
	}
	if(typeof config.selected_grows != "undefined"){
		this.selected_grows(config.selected_grows);
	}
	if(typeof config.width != "undefined"){
		this.width(config.width);
	}
	if(typeof config.height != "undefined"){
		this.height(config.height);
	}
	if(typeof config.edges != "undefined"){
		this.edges(config.edges);
	}
}


WOQLGraphConfig.prototype.prettyPrint = function(){
	var str = "view = WOQL.graph();\n";
	if(typeof this.literals() != "undefined"){
		str += "view.literals('" + this.literals() + "')\n";
	}
	if(typeof this.source() != "undefined"){
		str += "view.source('" + TerminusClient.UTILS.removeNamespaceFromVariable(this.source()) + "')\n";
	}
	if(typeof this.fontfamily() != "undefined"){
		str += "view.fontfamily('" + this.fontfamily() + "')\n";
	}
	if(typeof this.show_force() != "undefined"){
		str += "view.show_force('" + this.show_force() + "')\n";
	}
	if(typeof this.fix_nodes() != "undefined"){
		str += "view.fix_nodes('" + this.fix_nodes() + "')\n";
	}
	if(typeof this.explode_out() != "undefined"){
		str += "view.explode_out('" + this.explode_out() + "')\n";
	}
	if(typeof this.selected_grows() != "undefined"){
		str += "view.selected_grows('" + this.selected_grows() + "')\n";
	}
	if(typeof this.width() != "undefined"){
		str += "view.width('" + this.width() + "')\n";
	}
	if(typeof this.height() != "undefined"){
		str += "view.height('" + this.height() + "')\n";
	}
	if(typeof this.edges() != "undefined"){
		var nedges = this.edges();
		var estrs = [];
		for(var i = 0; i<nedges.length; i++){
			estrs.push("['" + nedges[i][0] + ", " + nedges[i][1] + "']");
		}
		str += "view.edges('" + estrs.join(", ") + "')\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint("graph") + "\n";
	}
	return str;
}

WOQLGraphConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	let mj = {"graph" : this.getConfigAsJSON(), "rules": jr};
	return mj;
}

function WOQLChartConfig(){
	this.rules = [];
	this.type = "chart";
}



/*
{"XAxis":{dataKey:"date_i",type:'number'}
							,"chartObj":
							[{'label':'Confident','dataKey':'conf',"chartType":"Area",
							"style":{"stroke":"#82ca9d", "fillOpacity":1, "fill":"#82ca9d"}},
							 {'label':'Predictions','dataKey':'predictions',"chartType":"Line",
							 "style":{"strokeWidth":2, "stroke":"#ff8000"}},
							 {'label':'Picks','dataKey':'picks',"chartType":"Point","style": 
							 {"stroke": '#8884d8', "fill": '#8884d8'}},
							 {'label':'Stock','dataKey':'stock',"chartType":"Line","style":
							  {"stroke": '#0000ff', "fill": '#0000ff'}}]}

{"XAxis":{dataKey:"v:Date","label":{rotate:"-50"}},"chartObj":
							  	[{'dot':true, 'label':'Quantity','dataKey':'v:Quantity',"chartType":"Line",  
							  	  "style": {"stroke": '#FF9800', "fill": '#FF9800'}}]
							  }
*/


WOQLChartConfig.prototype.xAxis = function(...vars){
	let woqlRule = new WOQLChartRule("XAxis");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.bar = function(...vars){
	let woqlRule=new WOQLChartRule("Bar");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.line=function(...vars){
	let woqlRule=new WOQLChartRule("Line");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.point=function(...vars){
	let woqlRule=new WOQLChartRule("Point");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.area=function(...vars){
	let woqlRule=new WOQLChartRule("Area");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

function WOQLViewRule(s){
	TerminusClient.WOQLRule.call(this,s);
	this.rule = {}; 
};
	
WOQLViewRule.prototype = Object.create(TerminusClient.WOQLRule.prototype);
WOQLViewRule.prototype.constructor = TerminusClient.WOQLRule;

WOQLViewRule.prototype.prettyPrint = function(type){
	//starts with obj. ...
	if(this.pattern){
		str = this.pattern.prettyPrint(type);
	}
	if(typeof this.color() != "undefined"){
		str += ".color([" + this.color().join(",") + "])";
	}
	if(typeof this.hidden() != "undefined"){
		str += ".hidden(" + this.hidden() + ")";
	}
	if(typeof this.size() != "undefined"){
		str += ".size('" + this.size() + "')";
	}
	if(typeof this.icon() != "undefined"){
		str += ".icon(" + JSON.stringify(this.icon()) + ")";
	}
	if(typeof this.text() != "undefined"){
		str += ".text(" + JSON.stringify(this.text()) + ")";
	}
	if(typeof this.border() != "undefined"){
		str += ".border(" + JSON.stringify(this.border()) + ")";
	}
	if(typeof this.args() != "undefined"){
		str += ".args(" + JSON.stringify(this.args()) + ")";
	}
	if(typeof this.renderer() != "undefined"){
		str += ".renderer('" + this.renderer() + "')";
	}
	if(typeof this.render() != "undefined"){
		str += ".render(" + this.render() + ")";
	}
	if(typeof this.click() != "undefined"){
		str += ".click(" + this.click() + ")";
	}
	if(typeof this.hover() != "undefined"){
		str += ".hover(" + this.hover() + ")";
	}
	return str;
}

WOQLViewRule.prototype.json = function(mjson){
	if(!mjson) {
		var json = { }
		if(this.pattern) json.pattern = this.pattern.json();
		json.rule = this.rule;
	    return json;
	}
	this.rule = mjson.rule || {};
	return this;
}


WOQLViewRule.prototype.size = function(size){
	if(typeof size == "undefined"){
		return this.rule.size;
	}
	this.rule.size = size;
	return this;
}

WOQLViewRule.prototype.color = function(color){
	if(typeof color == "undefined"){
		return this.rule.color;
	}
	this.rule.color = color;
	return this;
}

WOQLViewRule.prototype.icon = function(json){
	if(json){
		this.rule.icon = json;
		return this;
	}
	return this.rule.icon;
}

WOQLViewRule.prototype.text = function(json){
	if(json){
		this.rule.text = json;
		return this;
	}
	return this.rule.text;
}

WOQLViewRule.prototype.border = function(json){
	if(json){
		this.rule.border = json;
		return this;
	}
	return this.rule.border;
}

WOQLViewRule.prototype.renderer = function(rend){
	if(typeof rend == "undefined"){
		return this.rule.renderer;
	}
	this.rule.renderer = rend;
	return this;
}


WOQLViewRule.prototype.render = function(func){
	if(typeof func == "undefined"){
		return this.rule.render;
	}
	this.rule.render = func;
	return this;
}

WOQLViewRule.prototype.click = function(onClick){
	if(onClick){
		this.rule.click = onClick;
		return this;
	}
	return this.rule.click;
}

WOQLViewRule.prototype.hover = function(onHover){
	if(onHover){
		this.rule.hover = onHover;
		return this;
	}
	return this.rule.hover;
}

WOQLViewRule.prototype.hidden = function(hidden){
	if(typeof hidden == "undefined"){
		return this.rule.hidden;
	}
	this.rule.hidden = hidden;
	return this;
}

WOQLViewRule.prototype.args = function(args){
	if(typeof args == "undefined"){
		return this.rule.args;
	}
	this.rule.args = args;
	return this;
}


function WOQLGraphRule(scope){
	WOQLViewRule.call(this,scope); 
};

WOQLGraphRule.prototype = Object.create(WOQLViewRule.prototype);
WOQLGraphRule.prototype.constructor = WOQLViewRule;

WOQLGraphRule.prototype.charge = function(v){
	if(typeof v == "undefined"){
		return this.rule.charge;
	}
	this.rule.charge = v;
	return this;
}

WOQLGraphRule.prototype.collisionRadius = function(v){
	if(typeof v == "undefined"){
		return this.rule.collisionRadius;
	}
	this.rule.collisionRadius = v;
	return this;
}

WOQLGraphRule.prototype.arrow = function(json){
	if(json){
		this.rule.arrow = json;
		return this;
	}
	return this.rule.arrow;
}

WOQLGraphRule.prototype.distance = function(d){
	if(typeof d != "undefined"){
		this.rule.distance = d;
		return this;
	}
	return this.rule.distance;
}

WOQLGraphRule.prototype.symmetric = function(d){
	if(typeof d != "undefined"){
		this.rule.symmetric = d;
		return this;
	}
	return this.rule.symmetric ;
}


WOQLGraphRule.prototype.weight = function(w){
	if(typeof w != "undefined"){
		this.rule.weight = w;
		return this;
	}
	return this.rule.weight;
}

WOQLGraphRule.prototype.prettyPrint = function(type){
	var str = WOQLViewRule.prototype.prettyPrint.apply(this, type);
	if(typeof this.charge() != "undefined"){
		str += ".charge('" + this.charge() + "')";
	}
	if(typeof this.distance() != "undefined"){
		str += ".distance('" + this.distance() + "')";
	}
	if(typeof this.weight() != "undefined"){
		str += ".weight('" + this.weight() + "')";
	}
	if(typeof this.symmetric() != "undefined"){
		str += ".symmetric(" + this.symmetric() + ")";
	}
	if(typeof this.collisionRadius() != "undefined"){
		str += ".collisionRadius(" + this.collisionRadius() + ")";
	}	
	if(typeof this.arrow() != "undefined"){
		str += ".arrow(" + JSON.stringify(this.arrow()) + ")";
	}
	return str;
}

/*
 * Table
 */

 
function WOQLTableRule(scope){
	WOQLViewRule.call(this,scope); 
};

WOQLTableRule.prototype = Object.create(WOQLViewRule.prototype);
WOQLTableRule.prototype.constructor = WOQLViewRule;

WOQLTableRule.prototype.header = function(hdr){
	if(typeof hdr == "undefined"){
		return this.rule.header;
	}
	this.rule.header = hdr;
	return this;
}

WOQLTableRule.prototype.prettyPrint = function(type){
	var str = WOQLViewRule.prototype.prettyPrint.apply(this, type);
    if(typeof this.header() != "undefined"){
	    str += ".header(" + this.header() + ")";
    }
}

function WOQLChooserRule(scope){
	WOQLViewRule.call(this,scope); 
};

WOQLChooserRule.prototype = Object.create(WOQLViewRule.prototype);
WOQLChooserRule.prototype.constructor = WOQLViewRule;

WOQLChooserRule.prototype.label = function(l){
	if(l){
		this.rule.label = l;
		return this;
	}
	return this.rule.label;
}

WOQLChooserRule.prototype.title = function(l){
	if(l){
		this.rule.title = l;
		return this;
	}
	return this.rule.title;
}

WOQLChooserRule.prototype.values = function(l){
	if(l){
		this.rule.values = l;
		return this;
	}
	return this.rule.values;
}

/*
 * This is for chooser
 */
WOQLChooserRule.prototype.selected = function(s){
	if(typeof s != "undefined"){
		this.rule.selected = s;
		return this;
	}
	return this.rule.selected;
}

WOQLChooserRule.prototype.prettyPrint = function(type){
	var str = WOQLViewRule.prototype.prettyPrint.apply(this, type);
    if(typeof this.selected() != "undefined"){
	    str += ".selected(" + this.selected() + ")";
    }
    if(typeof this.label() != "undefined"){
	    str += ".label(\"" + this.label() + "\")";
    }
    if(typeof this.title() != "undefined"){
	    str += ".title(\"" + this.title() + "\")";
    }
    if(typeof this.values() != "undefined"){
	    str += ".values(\"" + this.values() + "\")";
	}
	return str;
}



/**
 * 
 * @param {Chart} scope  
 */
function WOQLChartRule(scope){
	WOQLViewRule.call(this,scope); 
};

WOQLChartRule.prototype = Object.create(WOQLViewRule.prototype);
WOQLChartRule.prototype.constructor = WOQLViewRule;

WOQLChartRule.prototype.style=function(key,value){
	if(value){
		this.rule[key]=value;
		return this;
	}
	return this.rule[key];
}

WOQLChartRule.prototype.fill=function(color){
	if(color){
		this.rule.fill = color;
		return this;
	}
	return this.rule.fill;
}

WOQLChartRule.prototype.stroke=function(color){
	if(color){
		this.rule['stroke'] = color;
		return this;
	}
	return this.rule['stroke'];
}


WOQLChartRule.prototype.strokeWidth=function(size){
	if(color){
		this.rule.strokeWidth = size;
		return this;
	}
	return this.rule.strokeWidth;
}


WOQLChartRule.prototype.dot=function(isVisible){
	if(isVisible){
		this.rule.dot = isVisible;
		return this;
	}
	return this.rule.dot;
}

WOQLChartRule.prototype.labelRotate=function(angle){
	if(angle){
		this.rule.labelRotate = angle;
		return this
	}
	return this.rule.labelRotate;
}

WOQLChartRule.prototype.axisType=function(type){
	if(type){
		this.rule.type=type
		return this;
	}
	return this.rule.type
}
/*
* works only if type is number
* domainArr =[min,max];
*/
WOQLChartRule.prototype.axisDomain=function(domainArr){
	if(domainArr){
		this.rule.domain=domainArr
		return this;
	}
	return this.rule.domain
}


function DocumentRule(scope){
	TerminusClient.FrameRule.call(this,scope); 
	this.rule = {};
};

DocumentRule.prototype = Object.create(TerminusClient.FrameRule.prototype);
DocumentRule.prototype.constructor = TerminusClient.FrameRule;

DocumentRule.prototype.renderer = function(rend){
	if(typeof rend == "undefined"){
		return this.rule.renderer;
	}
	this.rule.renderer = rend;
	return this;
}

DocumentRule.prototype.render = function(func){
	if(typeof func == "undefined"){
		return this.rule.render;
	}
	this.rule.render = func;
	return this;
}

DocumentRule.prototype.compare = function(func){
	if(typeof func == "undefined"){
		return this.rule.compare;
	}
	this.rule.compare = func;
	return this;
}

DocumentRule.prototype.mode = function(mode){
	if(typeof mode == "undefined"){
		return this.rule.mode;
	}
	this.rule.mode = mode;
	return this;
}

DocumentRule.prototype.collapse = function(func){
	if(typeof func == "undefined"){
		return this.rule.collapse;
	}
	this.rule.collapse = func;
	return this;
}

DocumentRule.prototype.hidden = function(func){
	if(typeof func == "undefined"){
		return this.rule.hidden;
	}
	this.rule.hidden = func;
	return this;
}

DocumentRule.prototype.view = function(m){
	if(!m) return this.rule.view;
	this.rule.view = m;
	return this;
}

/**
 * Should actions which are disabled in the given context be displayed?
 */
DocumentRule.prototype.showDisabledButtons = function(m){
	if(!m) return this.rule.show_disabled_buttons;
	this.rule.show_disabled_buttons = m;
	return this;
}

DocumentRule.prototype.header = function(m){
	if(!m) return this.rule.header;
	this.rule.header = m;
	return this;
}

DocumentRule.prototype.style = function(m){
	if(!m) return this.rule.style;
	this.rule.style = m;
	return this;
}

DocumentRule.prototype.headerStyle = function(m){
	if(!m) return this.rule.headerStyle;
	this.rule.headerStyle = m;
	return this;
}

DocumentRule.prototype.args = function(m){
	if(!m) return this.rule.args;
	this.rule.args = m;
	return this;
}

DocumentRule.prototype.showEmpty = function(m){
	if(!m) return this.rule.show_empty;
	this.rule.show_empty = m;
	return this;
}

DocumentRule.prototype.dataviewer = function(m){
	if(!m) return this.rule.dataviewer;
	this.rule.dataviewer = m;
	return this;
}

DocumentRule.prototype.features = function(...m){
	if(typeof m == "undefined" || m.length == 0) return this.rule.features;
	this.rule.features = m;
	return this;
}

DocumentRule.prototype.headerFeatures = function(...m){
	if(typeof m == "undefined" || m.length == 0) return this.rule.header_features;
	this.rule.header_features = m;
	return this;
}

DocumentRule.prototype.prettyPrint = function(type){
	if(this.pattern){
		str = this.pattern.prettyPrint(type);
	}
	if(typeof this.renderer() != "undefined"){
		str += ".renderer('" + this.renderer() + "')";
	}
	if(typeof this.render() != "undefined"){
		str += ".render(" + this.render + ")";
	}
	if(typeof this.compare() != "undefined"){
		str += ".compare(" + this.compare() + ")";
	}
	if(typeof this.mode() != "undefined"){
		str += ".mode('" + this.mode() + "')";
	}
	if(typeof this.collapse() != "undefined"){
		str += ".collapse(" + this.collapse() + ")";
	}
	if(typeof this.hidden() != "undefined"){
		str += ".hidden(" + this.hidden() + ")";
	}
	if(typeof this.view() != "undefined"){
		str += ".view('" + this.view() + "')";
	}
	if(typeof this.showDisabledButtons() != "undefined"){
		str += ".showDisabledButtons(" + this.showDisabledButtons() + ")";
	}
	if(typeof this.header() != "undefined"){
		str += ".header(" + this.header() + ")";
	}
	if(typeof this.style() != "undefined"){
		str += ".style(\"" + this.style() + "\")";
	}
	if(typeof this.headerStyle() != "undefined"){
		str += ".headerStyle(\"" + this.headerStyle() + "\")";
	}
	if(typeof this.args() != "undefined"){
		str += ".args(" + JSON.stringify(this.args()) + ")";
	}
	if(typeof this.showEmpty() != "undefined"){
		str += ".showEmpty(" + this.show_empty() + ")";
	}
	if(typeof this.dataviewer() != "undefined"){
		str += ".dataviewer(\"" + this.dataviewer() + "\")";
	}
	if(typeof this.features() != "undefined"){
		str += ".features(" + this.unpackFeatures(this.features()) + ")";
	}
	if(typeof this.headerFeatures() != "undefined"){
		str += ".headerFeatures(" + this.unpackFeatures(this.headerFeatures()) + ")";
	}
	return str;
}


function WOQLStreamRule(scope){
	WOQLViewRule.call(this,scope); 
};

WOQLStreamRule.prototype = Object.create(WOQLViewRule.prototype);
WOQLStreamRule.prototype.constructor = WOQLViewRule;

module.exports = TerminusClient.WOQL;