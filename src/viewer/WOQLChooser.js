const WOQLPatternMatcher = require("./WOQLRule");

/*
 * Very simple implementation of a WOQL backed chooser
 * Makes a drop down from a WOQL query
 * Given a variable to select element_value, element_label and element_title
 */

function WOQLChooser(client){
	this.client = client;
}

WOQLChooser.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLChooser.prototype.setResult = function(result){
	this.result = result;
	this.choices = [];
	this.cursor = 0;
	const variables = result.getVariableList();
	if(!this.value_variable && variables.length){
		this.value_variable = variables[0];
	}
	//sort it 
	if(this.sort_variable){
		this.result.sort(this.sort_variable);
	}
	while(row = this.result.next()){
		if(this.includeRow(row)){
			this.choices.push(this.rowToChoice());
		}
	}
	return this;
}

WOQLChooser.prototype.render = function(){
	if(this.renderer) return this.renderer.render(this);
}

WOQLChooser.prototype.options = function(config){
	this.value_variable = (config && typeof config.element_value != "undefined" ? config.element_value : "v:Element");
	this.label_variable = (config && typeof config.element_label != "undefined" ? config.element_label : "v:Label");
	this.title_variable = (config && typeof config.element_title != "undefined" ? config.element_title : "v:Comment");
	this.sort_variable = (config && typeof config.sort != "undefined" ? config.sort : false);
	this.choice = (config && config.choice ? config.choice : false);
	this.options = config || {};
	this.rpm = new WOQLPatternMatcher(config);
}

WOQLChooser.prototype.hasSpecialRenderer = function(row, type){
	const matched_rules = this.rpm.getMatchingRules(row, "data");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i][type]) return true;
	}
}

WOQLChooser.prototype.renderSpecial = function(row, type){
	const matched_rules = this.rpm.getMatchingRules(row, "data");
	var render = false;
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i][type]) render = matched_rules[i][type];
	}
	if(render && typeof render == "function"){
		return render(row);
	}
	if(render && typeof render == "string"){
		return render;
	}
}

WOQLChooser.prototype.includeRow = function(row){
	const matched_rules = this.rpm.getMatchingRules(row, "row");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].hidden) return false;
		if(matched_rules[i].filter && typeof(matched_rules[i].filter) == "function") {
			if(matched_rules[i].filter(row)) return false;
		}
	}
}


WOQLChooser.prototype.getLabelFromBinding = function(binding){
	if(this.hasSpecialRenderer(binding, "label")){
		return this.renderSpecial(binding, "label");
	}
	if(this.label_variable){
		if(binding[this.label_variable]){
			var lab = binding[this.label_variable];
			if(lab["@value"]) lab = lab["@value"];
			if(lab != "unknown") return lab;
		}
	}
	return TerminusClient.FrameHelper.labelFromURL(this.getRowID(binding));
}

WOQLChooser.prototype.getTitleFromBinding = function(binding, rownum){
	if(this.hasSpecialRenderer(binding, "title")){
		return this.renderSpecial(binding, "title");
	}
	if(this.title_variable){
		if(binding[this.title_variable]){
			var lab = binding[this.title_variable];
			if(lab["@value"]) lab = lab["@value"];
			if(lab != "unknown") return lab;
		}
	}
}

WOQLChooser.prototype.getSelectedFromBinding = function(binding){
	if(this.hasSpecialRenderer(binding, "selected")){
		return this.renderSpecial(binding, "selected");
	}
	if(this.selected_variable){
		if(binding[this.selected_variable]){
			if(binding[this.selected_variable] == "unknown") return false;
			return binding[this.selected_variable];
		}
	}
	return false;
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
		this.cursor--;
		return this.choices[this.cursor];
	}
}

WOQLChooser.prototype.next = function(){
	this.cursor++;
	return this.choices[this.cursor];
}


WOQLChooser.prototype.rowToChoice = function(binding, rownum){
	var choice = { id: this.getRowID(binding) };
	choice.label = this.getLabelFromBinding(binding, rownum);
	choice.title = this.getTitleFromBinding(binding, rownum);
	choice.selected = this.getSelectedFromBinding(binding, rownum);
	return choice;
}

WOQLChooser.prototype.getRowID = function(binding){
	var rval = binding[this.value_variable];
	if(rval['@value']) return rval['@value'];
	return rval;
}

module.exports = WOQLChooser;