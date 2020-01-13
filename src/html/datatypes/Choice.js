const TerminusClient = require('@terminusdb/terminus-client');

function HTMLChoiceViewer(options){};
HTMLChoiceViewer.prototype.options = function(options){}

HTMLChoiceViewer.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	if(frame.frame && frame.frame.elements){
		this.elements = frame.frame.elements;
	}
	return this.render(value);
}

HTMLChoiceViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}

HTMLChoiceViewer.prototype.render = function(value){
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-choice-value");
	input.setAttribute('data-value', value);
	var lab = false;
	if(value && this.elements){
		for(var i = 0; i<this.elements.length; i++){
			var elt = this.elements[i];
			if(elt.class == value){
				if(elt.label && elt.label["@value"]){
					lab = elt.label["@value"];
				}
				continue;
			}				
		}
	}
	if(value && !lab){
		lab = TerminusClient.UTILS.labelFromURL(value);					
	}
	if(lab){
		input.appendChild(document.createTextNode(lab));		
	}
	return input
}

module.exports={HTMLChoiceViewer}


