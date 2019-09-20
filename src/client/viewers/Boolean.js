const RenderingMap = require('../RenderingMap');

function HTMLBooleanViewer(options){
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
}

HTMLBooleanViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	if(value){
		var vallab = document.createTextNode(value);
		input.appendChild(vallab);
	}
	return input;
}

function HTMLBooleanEditor(options){
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
}

HTMLBooleanEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("input");
	input.setAttribute('type', "checkbox");
	if(value){
		input.setAttribute("checked", "checked");					
	}
	input.addEventListener("change", function(){
		if(value){
			renderer.set("");
		}
		else {
			renderer.set("true");
		}
	});
	return input;
}

RenderingMap.registerViewerForTypes("HTMLBooleanViewer", "Checkbox Viewer", ["xsd:boolean"]);
RenderingMap.registerEditorForTypes("HTMLBooleanEditor", "Checkbox Editor", ["xsd:boolean"]);

