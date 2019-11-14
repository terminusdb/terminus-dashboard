const TerminusClient = require('@terminusdb/terminus-client');

/*
 * Very simple implementation of a WOQL backed chooser
 * Makes a drop down from a WOQL query - configuration tells it which columns to use...
 */

function WOQLChooser(client, options){
	this.client = client;
	this.selected = false;
	return this.options(options);
}

WOQLChooser.prototype.options = function(config){
	this.config = config || TerminusClient.WOQL.chooser();	
	return this;
}

WOQLChooser.prototype.set = function(id){
	if(this.selected != id){
		this.selected = id;
		let ch = this.config.change();
		if(ch) ch(id);
	}
}

WOQLChooser.prototype.render = function(){
	if(this.renderer) return this.renderer.render(this);
}

WOQLChooser.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

/*
 * Sets up the required variables from the result / config
 */
WOQLChooser.prototype.setResult = function(result){
	this.result = result;
	this.choices = [];
	this.cursor = 0;
	const variables = result.getVariableList();
	if(!this.config.values() && variables.length){
		this.config.values(variables[0]);
	}
	//sort it 
	if(this.config.sort()){
		this.result.sort(this.config.sort(), this.config.direction());
	}
	while(row = this.result.next()){
		if(row && this.includeRow(row)){
			this.choices.push(this.rowToChoice(row, this.result.cursor));
		}
	}
	return this;
}

WOQLChooser.prototype.includeRow = function(row){
	const matched_rules = this.config.getMatchingRules(row, false, "row", "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].hidden) return false;
	}
	return true;
}

WOQLChooser.prototype.rowToChoice = function(binding, rownum){
	var choice = { 
		id: this.getRowID(binding) 
	};
	choice.label = this.getLabelFromBinding(binding, rownum);
	choice.title = this.getTitleFromBinding(binding, rownum);
	choice.selected = this.getSelectedFromBinding(binding, rownum);
	return choice;
}

WOQLChooser.prototype.getRowID = function(binding){
	var rval = binding[this.config.values()];
	if(rval['@value']) return rval['@value'];
	return rval;
}

WOQLChooser.prototype.getLabelFromBinding = function(binding, rownum){
	let sp = this.getSpecialRenderer(binding, "label");
	if(sp) return this.renderSpecial(sp, binding, rownum);
	if(this.config.labels()){
		if(binding[this.config.labels()]){
			var lab = binding[this.config.labels()];
			if(lab["@value"]) lab = lab["@value"];
			if(lab != "unknown") return lab;
		}
	}
	return TerminusClient.FrameHelper.labelFromURL(this.getRowID(binding));
}

WOQLChooser.prototype.getTitleFromBinding = function(binding, rownum){
	let sp = this.getSpecialRenderer(binding, "title");
	if(sp) return this.renderSpecial(sp, binding, rownum);
	if(this.config.titles()){
		if(binding[this.config.titles()]){
			var lab = binding[this.config.titles()];
			if(lab["@value"]) lab = lab["@value"];
			if(lab != "unknown") return lab;
		}
	}
	return false;
}

WOQLChooser.prototype.getSelectedFromBinding = function(binding){
	const matched_rules = this.config.getMatchingRules(row, false, "row", "selected");
	if(matched_rules && matched_rules.length){
		return matched_rules[matched_rules.length - 1].selected;
	}
	return false;
}

WOQLChooser.prototype.getSpecialRenderer = function(row, type){
	const matched_rules = this.config.getMatchingRules(row, false, "row", type);
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i][type]) return matched_rules[i][type];
	}
	return false;
}

WOQLChooser.prototype.renderSpecial = function(rule, row, rownum){
	if(rule && typeof rule == "function"){
		return render(row);
	}
	if(rule && typeof rule == "string"){
		return rule;
	}
}

WOQLChooser.prototype.count = function(){
	return this.result.count();
}

WOQLChooser.prototype.first = function(){
	this.cursor = 0;
	return this.choices[this.cursor];
}

WOQLChooser.prototype.prev = function(){
	if(this.cursor > 0) {
		return this.choices[--this.cursor];
	}
}

WOQLChooser.prototype.next = function(){
	return this.choices[this.cursor++];
}


module.exports = WOQLChooser;