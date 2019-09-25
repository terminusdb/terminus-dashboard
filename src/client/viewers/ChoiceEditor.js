const HTMLFrameHelper = require('../HTMLFrameHelper');
const RenderingMap = require('../RenderingMap');

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

module.exports={HTMLChoiceEditor}

