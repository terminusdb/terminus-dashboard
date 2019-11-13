const WOQLPatternMatcher = require("./WOQLRule");

function WOQLRuleViewer(client){
	this.client = client;
	this.rules = [];
}

WOQLRuleViewer.prototype.options = function(options){
	this.options = options;
	return this;
}

WOQLRuleViewer.prototype.setRules = function(rules){
	this.rules = rules;
	return this;
}

WOQLRuleViewer.prototype.addRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLRuleViewer.prototype.render = function(){
	if(this.renderer) return this.renderer.render(this);
}

//parses a string encoding a woql in either json or js notation
WOQLRuleViewer.prototype.parseText = function(text, format){
	try {
		if(format == "json"){
			
			var qval = JSON.parse(text);
			return WOQL.json(qval);
		}
		else {
			var nw = eval("WOQL." + text);
			return nw;
		}
	}
	catch(e){
		this.error("Failed to parse Query " + e.toString());
	}
}

WOQLRuleViewer.prototype.submitQuery = function (query) {}

WOQLRuleViewer.prototype.error = function(msg){
	console.log(msg);
}

WOQLRuleViewer.prototype.serialise = function(query, format){
	if(format == "json"){
		return JSON.stringify(query.json(), 0, 2);
	}
	else {
		return query.prettyPrint(4);
	}
}

module.exports = WOQLRuleViewer;