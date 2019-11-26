const TerminusClient = require('@terminusdb/terminus-client');


function SimpleStream(){	
	this.holder = document.createElement("div");
}

SimpleStream.prototype.options = function(options){
	for(var k in options){
		this[k] = options[k];
	}
	return this;
}


SimpleStream.prototype.render = function(stream){
	if(stream) this.stream = stream;
	TerminusClient.FrameHelper.removeChildren(this.holder);
	//var ctls = this.getControlsDOM();
	//var tab = this.getTableDOM();
	//if(ctls) this.holder.appendChild(ctls)
	//this.holder.appendChild(tab);
	return this.holder;
}

module.exports = SimpleStream;