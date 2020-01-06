function HTMLMarkupEditor(options){}

HTMLMarkupEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var input = document.createElement("div");
	input.setAttribute('class', "html-wysiwyg");
	var inner = document.createElement("span");
	inner.setAttribute('class', "html-literal literal-value");
	inner.innerHTML=value;
	input.appendChild(inner);
	if(typeof Quill != "undefined"){
		var quill = new Quill(inner, { theme: 'snow' });
		quill.on("text-change", function(){
			frame.set(quill.root.innerHTML);
		});
	}
	return input;
}

module.exports={HTMLMarkupEditor}