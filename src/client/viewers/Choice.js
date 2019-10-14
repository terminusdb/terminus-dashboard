function HTMLChoiceViewer(options){};
const TerminusClient = require('@terminusdb/terminus-client');

HTMLChoiceViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-choice-value");
	input.setAttribute('data-value', value);
	if(value){
		var els = renderer.frame.frame.elements;
		for(var i = 0; i<els.length; i++){
			if(els[i].class == value){
				if(els[i].label && els[i].label["@value"]){
					var lab = els[i].label["@value"];
				}
				else {
					lab = TerminusClient.FrameHelper.labelFromURL(value);					
				}
				input.appendChild(document.createTextNode(lab));
				continue;
			}				
		}
	}
	return input;
}

module.exports={HTMLChoiceViewer}


