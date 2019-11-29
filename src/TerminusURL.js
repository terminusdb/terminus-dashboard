const UTILS = require("./Utils.js");

function TerminusURLLoader(ui, val){
	this.ui = ui;
	this.val = val;
	this.url_input = false;
	this.key_input = false;
}

TerminusURLLoader.prototype.getLabelDOM = function(){
	return document.createTextNode("Connect");
}

TerminusURLLoader.prototype.getFormFieldDOM = function(ip, fname, ltxt, pholder){
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-horizontal terminus-control-group terminus-form-field-spacing terminus-display-flex terminus-field-"+fname);
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-control-label terminus-form-label terminus-form-field-label terminus-label-"+fname);
	lab.appendChild(document.createTextNode(ltxt))
	ip.setAttribute("type", "text");
	ip.setAttribute("placeholder", pholder);
	sci.appendChild(lab);
	sci.appendChild(ip);
	return sci;
}

TerminusURLLoader.prototype.getAsDOM = function(){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-form terminus-url-loader");
	scd.appendChild(UTILS.getHeaderDom('Connect To Terminus Server'));
	var mfd = document.createElement('div');
	mfd.setAttribute('class', 'terminus-form-border terminus-margin-top');
	scd.appendChild(mfd);
	this.url_input = document.createElement("input");
	this.url_input.setAttribute("class", "terminus-form-value terminus-form-url terminus-form-field-input terminus-input-text");
	if(this.val){
		this.url_input.value = this.val;
	}
	var dht = document.createElement('div');
	dht.setAttribute('class', 'terminus-form-margin-top');
	mfd.appendChild(dht);
	mfd.appendChild(this.getFormFieldDOM(this.url_input, "connect", "URL", "Terminus DB URL"));
	this.key_input = document.createElement("input");
	this.key_input.setAttribute("class", "terminus-form-value terminus-value terminus-input-text");
	mfd.appendChild(this.getFormFieldDOM(this.key_input, "connect", "Key", "Server API Key"));
	var loadbuts = document.createElement("div");
	loadbuts.setAttribute("class", "terminus-control-buttons");
	var loadbut = document.createElement("button");
	loadbut.setAttribute("class", "terminus-control-button terminus-url-load terminus-btn terminus-btn-float-right");
	loadbut.appendChild(document.createTextNode("Connect"));
	var self = this;
	loadbut.addEventListener("click", function(){
		if(self.url_input.value){
			self.ui.load(self.url_input.value, self.key_input.value);
		}
	});
	loadbuts.appendChild(loadbut);
	mfd.appendChild(loadbuts);
	return scd;
}


module.exports=TerminusURLLoader
