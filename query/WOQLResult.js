function WOQLResult(res, query ,options){
	this.query = query;
	this.bindings = ((res && res.result) ? res.result.bindings : []);
}

WOQLResult.prototype.count = function(){
	return this.bindings.length;
}

WOQLResult.prototype.shorten = function(url){
	return this.query.shorten(url);
}


WOQLResult.prototype.hasBindings = function(){
	return this.bindings.length;
}