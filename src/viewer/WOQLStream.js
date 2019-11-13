/*
 * Maps a woql query to a stream of results...
 */

function WOQLStream(client){
	this.client = client;
}

WOQLStream.prototype.options = function(opts){
	this.page_size = 10;
	return this;
}

WOQLStream.prototype.setResult = function(wqrs){
	this.result = wqrs;
}

WOQLStream.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLStream.prototype.render = function(){
	if(this.renderer) return this.renderer.render(this);
}

module.exports = WOQLStream;