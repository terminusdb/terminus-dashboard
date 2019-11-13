const HTMLFrameHelper = require('../HTMLFrameHelper');

function HTMLChoiceEditor(options){};

HTMLChoiceEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var optInput = document.createElement("select");
	optInput.setAttribute('class', "terminus-choice-picker");
	var foptions = frame.getChoiceOptions();
	foptions.unshift({ value: "", label: "Not Specified"});
	var callback = function(val){
		frame.set(val);
	}
	var sel = HTMLFrameHelper.getSelectionControl("select-choice", foptions, value, callback);
	return sel;
}

module.exports={HTMLChoiceEditor}

