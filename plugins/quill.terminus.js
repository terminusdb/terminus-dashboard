function HTMLMarkupEditor(options){}
HTMLMarkupEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = FrameHelper.getShorthand(renderer.frame.range);
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
RenderingMap.registerEditorForTypes("HTMLMarkupEditor", "Quill WYSIWIG HTML Editor", ["xdd:html"]);
