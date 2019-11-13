const TerminusClient = require('@terminusdb/terminus-client');

function SimpleTextbox(woql){
	this.woql = woql;
	this.placeholder = "Enter Query";
	this.button = "Submit";
	this.width = 1000;
	this.height = 600;
	this.format = "js";
	this.input = document.createElement("textarea");	
}

SimpleTextbox.prototype.options = function(options){
	this.format = (options && options.type ? options.type : "js");
	return this;
}


SimpleTextbox.prototype.get = function(){
	return this.woql.parseText(this.input.value);
}

SimpleTextbox.prototype.set = function(woq){
	this.input.value = this.woql.serialise(woq, this.format);
}

SimpleTextbox.prototype.error = function(string){
	this.viewer.inputError(string);
}

SimpleTextbox.prototype.render = function(){
	return this.getAsDOM();
}

SimpleTextbox.prototype.getAsDOM = function(){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-textbox-input terminus-query-section");
	this.input.setAttribute("class", "terminus-query-box");
	if(this.placeholder){
		this.input.setAttribute("placeholder", this.placeholder);
	}
	if(this.width && this.height){
		this.input.setAttribute("style", "width: "+ this.width +"px; height: "+ this.height + "px;");	
	}
	qbox.appendChild(this.input);
	var self = this;
	if(this.button){
		var qbut = document.createElement("button");
		qbut.setAttribute("class", "terminus-control-button terminus-btn")
		qbut.appendChild(document.createTextNode(this.button));
		qbut.addEventListener("click", function(){
			var woq = self.get();
			if(woq){
				self.woql.submitQuery(woql);
			}
		});
		qbox.appendChild(qbut);
	}
	return qbox;
}



module.exports = SimpleTextbox;