function HTMLEntityEditor(options){}
HTMLEntityEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("input");
	input.setAttribute("class", "terminus-literal-value terminus-entity-reference-value");
	input.setAttribute("type", "text");
	input.setAttribute('size', 80);
	input.value = value;
	var self = this;
	input.addEventListener("change", function(){
		var url = this.value;
		if(url.indexOf("/") == -1 && url.indexOf(":") == -1){
			url = "doc:" + url;
		}
		renderer.set(url);
	});
	return input;
}

module.exports={HTMLEntityEditor}