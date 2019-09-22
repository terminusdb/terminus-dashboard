function HTMLChoiceViewer(options){};

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
					input.appendChild(document.createTextNode(els[i].label["@value"]));
				}
				else {
					input.appendChild(FrameHelper.labelFromURL(value));					
				}
				continue;
			}				
		}
	}
	return input;
}

module.exports={HTMLChoiceViewer}


