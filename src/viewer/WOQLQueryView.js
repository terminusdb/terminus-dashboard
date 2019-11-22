const TerminusClient = require('@terminusdb/terminus-client');

function WOQLQueryView(client){
	this.client = client;
}

WOQLQueryView.prototype.options = function(options){
	this.options = options;
	return this;
}

WOQLQueryView.prototype.setQuery = function(query){
	this.query = query;
	return this;
}

WOQLQueryView.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLQueryView.prototype.render = function(){
	if(this.renderer){
		if(this.query){
			this.renderer.set(this.query);
		}
		return this.renderer.render(this);
	}
}

//parses a string encoding a woql in either json or js notation
WOQLQueryView.prototype.parseText = function(text, format){
	try {
		var WOQL = TerminusClient.WOQL;
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

WOQLQueryView.prototype.submitQuery = function(qObj){

}

WOQLQueryView.prototype.error = function(msg){
	console.log(msg);
}

WOQLQueryView.prototype.serialise = function(query, format){
	if(format == "json"){
		return JSON.stringify(query.json(), 0, 2);
	}
	else {
		return query.prettyPrint(4);
	}
}

module.exports = WOQLQueryView;
