function HTMLImageEditor(options){}
HTMLImageEditor.prototype.renderFrame = function(frame, dataviewer){
	if(this.type == "xsd:base64Binary"){
		var input = document.createElement("textarea");
		input.setAttribute('class', "terminus-literal-value terminus-literal-b64image-value");
		input.value = value;
		input.addEventListener("change", function(){
			frame.set(this.value);
		});
		return input;
	}
	return false;
}

module.exports={HTMLImageEditor}