

function HTMLImageEditor(options){}
HTMLImageEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.range);
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

module.exports={HTMLImageEditor}