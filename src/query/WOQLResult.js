function WOQLResult(res, query ,options){
	this.query = query;
	this.bindings = ((res && res.bindings) ? res.bindings : []);
}

WOQLResult.prototype.count = function(){
	return this.bindings.length;
}

WOQLResult.prototype.shorten = function(url){
	return this.query.shorten(url);
}


WOQLResult.prototype.hasBindings = function(result){
	if(result) return (result.bindings && result.bindings.length);
	else return (this.bindings && this.bindings.length);
}
