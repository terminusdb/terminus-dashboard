WOQLTimePicker = function(config){
	this.type = (config && config.slidertype ? config.slidertype : "range");
	this.timeslice = false;
	var defch = function(from, to, ss){
		alert("changed to: (from) " + from + " ... (to) " + to + " (" + ss + ")");
	};
	this.change = config && config.change ? config.change : defch;  
	this.years = (config && config.years ? config.years : 20);
	this.server_side = false;
}

WOQLTimePicker.prototype.toggleServerSideFiltering = function(val){
	this.server_side = !this.server_side;
}

WOQLTimePicker.prototype.getSliderParameters = function(val){
	start = 0;
	end = this.years;
	var self = this;
	var pointInit = {
			min: start, 
			max: end, 
			value: val,
			slide: function(event, ui){
				var tt = self.tickToTime(ui.value);
				self.changeTimeSlice(tt);
			}
	}
	var rangeInit = {
			range: true,
			min: start, 
			max: end, 
			values: val,
			slide: function(event, ui){
				self.changeTimeSlice(self.tickToTime(ui.values[0]), self.tickToTime(ui.values[1]));
			}
	}
	var sconfig = (this.type == "range" ? rangeInit : pointInit);
	return sconfig;
}

WOQLTimePicker.prototype.changeTimeSlice = function(val, val2, noshow){
	if(this.type == "range"){
		this.timeslice = {};
		this.timeslice.from = val;
		this.timeslice.to = val2;
		this.change(val, val2, this.server_side);
	}
	else {
		this.timeslice = val;
		this.change(val, false, this.server_side);
	}
	if(!noshow){	
		this.showCurrentPick();
	}
}

WOQLTimePicker.prototype.tickToTime = function(ticknum){
	if(ticknum == 0){
		var nval = 0;
	}
	else {
		var year = 31622400 ;
		var seconds_ago = year * (this.years - ticknum);
		var now = new Date().getTime()/1000;
		var nval = now - seconds_ago;
	}
	return nval;
}


WOQLTimePicker.prototype.timeToTick = function(timeval){
	if(timeval){
		var y = (new Date(timeval * 1000)).getFullYear();
		var thisy = (new Date()).getFullYear();
		return this.years - (thisy -y);
	}
	return 0;
}

WOQLTimePicker.prototype.changeSliderType = function(ntype){
	var val, val2;
	if(this.type == "point" && ntype == "range"){
		if(this.timeslice){
			val = this.timeslice
			val2 = this.timeslice;
		}
	}
	else if(this.type == "range" && ntype == "point"){
		if(this.timeslice){
			if(this.timeslice.from == 0 && this.timeslice.to == 0) val = false;
			else if(this.timeslice.from == 0) val = this.timeslice.to;
			else if(this.timeslice.to == 0) val = this.timeslice.from;
			else val = (this.timeslice.from + this.timeslice.to) / 2;
			val2 = false;
		}
		else {
			val = 0;
		}
		
	}
	this.type = ntype;
	this.changeTimeSlice(val, val2, true);
	this.updateSliderDOM();
}

WOQLTimePicker.prototype.getSliderTypeDOM = function(){
	var dcd = document.createElement("span");
	dcd.setAttribute("class", "terminus-parameter");
	var lab = document.createElement("label");
	lab.appendChild(document.createTextNode("Dates"));
	dcd.appendChild(lab);
	var self = this;
	var sel = document.createElement("select");
	var opt = document.createElement("option");
	opt.value = "";
	opt.appendChild(document.createTextNode("None"));
	if(this.type == ""){
		opt.setAttribute("selected", "selected");
	}
	sel.appendChild(opt);
	opt = document.createElement("option");
	opt.value = "point";
	opt.appendChild(document.createTextNode("Point"));
	if(this.type == "point"){
		opt.setAttribute("selected", "selected");
	}
	sel.appendChild(opt);
	opt = document.createElement("option");
	opt.value = "range";
	opt.appendChild(document.createTextNode("Range"));
	if(this.type == "range"){
		opt.setAttribute("selected", "selected");
	}
	sel.appendChild(opt);
	var self = this;
	sel.addEventListener("change", function(){
		if(this.value != self.type){
			self.changeSliderType(this.value);
		}
	});
	dcd.appendChild(sel);
	
	var cb = document.createElement("input");
	cb.setAttribute("type", "checkbox");
	var elid = this.browserid + "-ssp";
	if(this.server_side){
		cb.setAttribute("checked", true);
	}
	var self = this;
	cb.addEventListener("change", function(){
		self.toggleServerSideFiltering();
	});
	var lb = document.createElement("label");
	lb.setAttribute("for", elid);
	lb.appendChild(document.createTextNode("Server Side"));
	dcd.appendChild(lb);
	dcd.appendChild(cb);
	return dcd;
	
}

WOQLTimePicker.prototype.updateSliderDOM = function(){
	this.slideDOM = this.getSliderDOM();
}

WOQLTimePicker.prototype.getSliderDOM = function(start, end){
	if(this.slideDOM){
		jQuery(this.slideDOM).empty();
	}
	else {
		this.slideDOM = document.createElement("div");
		this.slideDOM.setAttribute("class", "terminus-controller-slider");
	}
	if(this.type == ""){
		this.changeTimeSlice(false);
		return this.slideDOM;
	}
	var TopAxisDOM = document.createElement("div");
	TopAxisDOM.setAttribute("class", "terminus-controller-slider-panel terminus-controller-slider-topaxis");
	if(this.type == "point"){
		this.curdate = document.createElement("span");
		this.curdate.setAttribute("class", "terminus-slider-current terminus-slider-current-date");
		TopAxisDOM.appendChild(this.curdate);
	}
	else if(this.type == "range") {
		this.cursdate = document.createElement("span");
		this.cursdate.setAttribute("class", "terminus-slider-current terminus-slider-current-date-start");
		TopAxisDOM.appendChild(this.cursdate);
		this.curedate = document.createElement("span");		
		this.curedate.setAttribute("class", "terminus-slider-current terminus-slider-current-date-end");
		TopAxisDOM.appendChild(this.curedate);
	}
	this.slideDOM.appendChild(TopAxisDOM);
	this.showCurrentPick();
	var LabelDOM = document.createElement("span");
	LabelDOM.setAttribute("class", "terminus-controller-slider-label terminus-controller-slider-startlabel");
	this.slideDOM.appendChild(LabelDOM);
	var PayloadDOM = document.createElement("div");
	PayloadDOM.setAttribute("class", "terminus-controller-slider-payload");
	this.slideDOM.appendChild(PayloadDOM);
	var L2DOM = document.createElement("span");
	L2DOM.setAttribute("class", "terminus-controller-slider-label terminus-controller-slider-endlabel");
	this.slideDOM.appendChild(L2DOM);
	L2DOM.appendChild(this.getSliderAxisDOM());
	var sconfig = this.getSliderParameters(this.getTimesliceAsTicks());
	jQuery(PayloadDOM).slider(sconfig);
	return this.slideDOM;
}

WOQLTimePicker.prototype.getTimesliceAsTicks = function(){
	if(this.timeslice){
		if(this.type == "range"){
			vtf = (this.timeslice.from ? this.timeToTick(this.timeslice.from) : 0);
			vtt = (this.timeslice.to ? this.timeToTick(this.timeslice.to) : 0);
			var val = [vtf, vtt];
		}
		else {
			var val = this.timeToTick(this.timeslice)
		}
	}
	else {
		var val = (this.type == "range" ? [0, this.years] : 0);
	}
	return val;
}

WOQLTimePicker.prototype.showCurrentPick = function(){
	if(this.type == "range"){
		if(!this.timeslice.from) {
			var nd  = new Date();
			var fy = nd.getFullYear() - this.years;
		}
		else {
			var nd = new Date(this.timeslice.from * 1000);
			var fy = nd.getFullYear(); 
		}
		this.cursdate.innerHTML = fy;
		this.adjustOffset(this.cursdate, this.timeslice.from);
		if(!this.timeslice.to) {
			var ty = new Date().getFullYear();
		}
		else {
			var ty = new Date(this.timeslice.to * 1000).getFullYear(); 
		}
		if(ty != fy){
			this.curedate.innerHTML = ty;
			this.adjustOffset(this.curedate, this.timeslice.to, true);
			//jQuery(this.curedate).show();
		}
		else {
			this.curedate.innerHTML = "";
		}
	}
	else {
		if(this.timeslice){
			var nd = new Date(this.timeslice * 1000);
			fy = nd.getFullYear(); 
		}
		else {
			fy = "off";
		}
		this.curdate.innerHTML = fy;
		this.adjustOffset(this.curdate, this.timeslice);
	}
}

WOQLTimePicker.prototype.adjustOffset = function(dom, tval, r){
	var tick = this.timeToTick(tval);
	var totwidth = 50 + (this.slideDOM.offsetWidth ? this.slideDOM.offsetWidth : 0);
	var unit = totwidth / (this.years + 1);
	var box = -25;
	var which = (r ? "margin-right" : "margin-left");
	if(r){
		if(tick){
			var off = ((this.years - tick) * unit) + box;
		}
		else {
			var off = box;
		}
		dom.setAttribute("style", "margin-right: " + off + "px");
	}
	else {
		var off = unit * tick + box;
		dom.setAttribute("style", "margin-left: " + off + "px");
	}
}

WOQLTimePicker.prototype.getSliderAxisDOM = function(){
	var cdom = document.createElement("div");
	cdom.setAttribute("class", "terminus-slider-axis-wrapper");
	var fy = new Date().getFullYear();
	var sd = fy%5;
	var vals = [];
	for(var i = this.years; i>0; i-=5){
		var val = (fy-i) - sd + 5;
		vals.push(val);
	}
	for(var i = 0; i<vals.length; i++){
		var ldom = document.createElement("label");
		ldom.setAttribute("class", "terminus-axis-label");
		ldom.innerHTML = "<div class='terminus-tick'>|</div>"+ vals[i];
		cdom.appendChild(ldom);
	}
	ndom = document.createElement("label");
	ndom.setAttribute("class", "terminus-axis-label terminus-axis-now-label");
	cdom.appendChild(ndom);
	return cdom;
}

WOQLTimePicker.prototype.Y2Time = function(y){
	return (new Date(y+ "-12-31T12:00:00.000Z").getTime() / 1000);
}

module.exports=WOQLTimePicker
