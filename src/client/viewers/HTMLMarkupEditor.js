const TerminusClient = require('@terminusdb/terminus-client');

function HTMLMarkupEditor(options){}
HTMLMarkupEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.getType());
	ty = (ty ? ty : renderer.frame.getType());
	var input = document.createElement("div");
	input.setAttribute('class', "html-wysiwyg");
	var inner = document.createElement("span");
	inner.setAttribute('class', "html-literal literal-value");
	inner.innerHTML=value;
	input.appendChild(inner);
	if(typeof Quill != "undefined"){
		var quill = new Quill(inner, { theme: 'snow' });
		quill.on("text-change", function(){
			renderer.set(quill.root.innerHTML);
		});
	}
	return input;
}

module.exports={HTMLMarkupEditor}