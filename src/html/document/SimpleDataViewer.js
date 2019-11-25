const HTMLFrameHelper = require("../HTMLFrameHelper");

function SimpleDataViewer(){}

SimpleDataViewer.prototype.render = function(frame){
	var ndom = HTMLFrameHelper.getFrameDOM("data", frame, "page");
	if(!ndom) return false;
	if(this.framedom){
		this.framedom.replaceWith(ndom);
	}
	this.framedom = ndom;
	this.framedom.appendChild(document.createTextNode(frame.get()));
	return this.framedom;
}

module.exports = SimpleDataViewer;