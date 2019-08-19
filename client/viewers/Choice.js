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
				if(els[i].label && els[i].label.data){
					input.appendChild(document.createTextNode(els[i].label.data));
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

function HTMLChoiceEditor(options){};

HTMLChoiceEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var optInput = document.createElement("select");
	optInput.setAttribute('class', "terminus-choice-picker");
	var foptions = renderer.frame.getChoiceOptions();
	foptions.unshift({ value: "", label: "Not Specified"});
	var callback = function(val){
		renderer.set(val);
	}
	var sel = HTMLFrameHelper.getSelectionControl("select-choice", foptions, value, callback);
	return sel;
}

RenderingMap.registerViewerForFrameType("HTMLChoiceViewer", "Choice Viewer", "oneOf");
RenderingMap.registerEditorForFrameType("HTMLChoiceEditor", "Choice Selector", "oneOf");

