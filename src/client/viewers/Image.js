const FrameHelper = require('../FrameHelper');
const RenderingMap = require('../RenderingMap');

function HTMLImageViewer(options){
}
HTMLImageViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-image-value");
	input.setAttribute('data-value', value);
	if(value){
		var img = document.createElement("a");
		img.setAttribute('src', value);
		input.appendChild(img);
	}
	return input;
}

function HTMLImageEditor(options){}
HTMLImageEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	if(ty == "xsd:base64Binary"){
		var input = document.createElement("textarea");
		input.setAttribute('class', "terminus-literal-value terminus-literal-b64image-value");
		input.value = value;
		input.addEventListener("change", function(){
			renderer.set(this.value);
		});
		return input;
	}
	return false;
}

RenderingMap.registerViewerForTypes("HTMLImageViewer", "Image Viewer", ["xdd:url", "xsd:anyURI", "xsd:base64Binary"]);
RenderingMap.registerEditorForTypes("HTMLImageEditor", "Image Editor", ["xsd:base64Binary"]);



