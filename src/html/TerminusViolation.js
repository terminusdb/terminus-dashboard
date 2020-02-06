function TerminusViolations(vios, ui){
	this.ui = ui;
	this.vios = [];
	var nvios = [];
	for(var i = 0; i<vios.length; i++){
		nvios.push(vios[i]);
	}
	for(var i = 0; i<nvios.length; i++){
		this.vios.push(new TerminusViolation(nvios[i], this.ui));
	}
}

TerminusViolations.prototype.getAsDOM = function(context_msg){
	var vdom = document.createElement("div");
	vdom.setAttribute("class", "terminus-violations terminus-show-msg-vio");
	var vioHeading = document.createElement("div");
	vioHeading.setAttribute('class', 'terminus-violations-heading');
	vdom.appendChild(vioHeading);
	var msg = this.vios.length + (this.vios.length > 1 ? " Violations Detected" : " Violation Detected");
	if(context_msg) msg += " " + context_msg;
	vioHeading.appendChild(document.createTextNode(msg));
	for(var i = 0; i<this.vios.length; i++){
		vdom.appendChild(this.vios[i].getAsDOM());
	}
	return vdom;
}

/*
 * Class for displaying violation reports as HTML
 */
function TerminusViolation(vio, ui){
	this.ui = ui;
	this.vio = vio;
}

TerminusViolation.prototype.getAsDOM = function(){
	var vdom = document.createElement("div");
	vdom.setAttribute("class", "terminus-violation");
	if(this.vio['@type']){
		var msg = this.vio['vio:message'] || {"@value": ""};
		vdom.appendChild(this.getPropertyAsDOM(this.vio["@type"], msg));
	}
	for(var prop in this.vio){
		if(prop != "vio:message" && prop != "@type"){
			vdom.appendChild(this.getPropertyAsDOM(prop, this.vio[prop]));
		}
	}
	return vdom;
}

TerminusViolation.prototype.getPropertyAsDOM = function(prop, val){
	var pdom = document.createElement("div");
	pdom.setAttribute("class", "terminus-violation-property");
	var ldom = document.createElement("span");
	ldom.setAttribute("class", "terminus-label terminus-violation-property-label");
	ldom.appendChild(document.createTextNode(prop));
	var vdom = document.createElement("span");
	vdom.setAttribute("class", "terminus-violation-property-value");
	var mval = val["@value"] || val;
	if(mval && typeof mval != "object") vdom.appendChild(document.createTextNode(mval));
	pdom.appendChild(ldom);
	pdom.appendChild(vdom);
	return pdom;
}

module.exports=TerminusViolations
