const HTMLFrameHelper = require("../HTMLFrameHelper");

function SimplePropertyViewer(){}

SimplePropertyViewer.prototype.render = function(frame){
	var ndom = HTMLFrameHelper.getFrameDOM("property", frame, "page");
	if(!ndom) return false;
	if(this.framedom){
		this.framedom.replaceWith(ndom);
	}
	this.framedom = ndom;
    let vals = frame.renderValues();
    for(var i = 0; i<vals.length; i++){
		if(vals) this.framedom.appendChild(vals);
	}
	return this.framedom;
}



module.exports = SimplePropertyViewer;