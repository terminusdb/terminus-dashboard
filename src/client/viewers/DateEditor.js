const DateHelper = require('./DateHelper');

function HTMLDateEditor(options){
	this.max = (options && options.max ? options.max : false);
	this.min = (options && options.min ? options.min : false);
	this.allowbce = (options && options.allowbce ? options.allowbce : false);
	this.date_spacer = "/";
	this.time_spacer = ":";
	this.datetime_separator = ", ";
	this.helper = new DateHelper.HTMLDateHelper();
}

HTMLDateEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.getType());
	ty = (ty ? ty : renderer.frame.getType())
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-date");
	input.setAttribute('data-value', value);
	if(value){
		this.parsed = TerminusClient.FrameHelper.parseDate(ty, value);
	}
	else this.parsed = {};
	var datepart = this.getDateComponentDOM(this.parsed, ty, renderer);
	var timepart = this.getTimeComponentDOM(this.parsed, ty, renderer);
	if(timepart) input.appendChild(timepart);
	if(timepart && datepart) input.appendChild(document.createTextNode(this.datetime_separator));
	if(datepart) input.appendChild(datepart);
	return input;
}

HTMLDateEditor.prototype.set = function(part, val, renderer, ty){
	this.parsed[part] = val;
	var xsd = TerminusClient.FrameHelper.xsdFromParsed(this.parsed, ty);
	if(xsd){
		renderer.set(xsd);
	}
}

HTMLDateEditor.prototype.getTimeComponentDOM = function(parsed, ty, renderer){
	if(["xsd:dateTime", "xsd:dateTimeStamp", "xsd:time"].indexOf(ty) == -1){
		return false;
	}
	var self = this;
	var hdom = document.createElement("input");
	hdom.setAttribute("class", "terminus-hour-input terminus-hour-"+ty);
	hdom.setAttribute("size", 2);
	hdom.setAttribute("placeholder", "HH");
	hdom.value = (parsed.hour ? parsed.hour : "");
	hdom.addEventListener("input", function(){
		self.set("hour", this.value, renderer, ty);
	});
	var mdom = document.createElement("input");
	mdom.setAttribute("class", "terminus-minute-input terminus-minute-"+ty);
	mdom.setAttribute("size", 2);
	mdom.setAttribute("placeholder", "MM");
	mdom.value = (parsed.minute ? parsed.minute: "");
	mdom.addEventListener("input", function(){
		self.set("minute", this.value, renderer, ty);
	});
	var sdom = document.createElement("input");
	sdom.setAttribute("class", "terminus-second-input terminus-second-"+ty);
	sdom.setAttribute("size", 8);
	sdom.setAttribute("placeholder", "SS.sss...");
	sdom.value = (parsed.second ? parsed.second: "");
	sdom.addEventListener("input", function(){
		self.set("second", this.value, renderer, ty);
	})
	var tdom = document.createElement("span");
	tdom.appendChild(hdom);
	tdom.appendChild(document.createTextNode(this.time_spacer));
	tdom.appendChild(mdom);
	tdom.appendChild(document.createTextNode(this.time_spacer));
	tdom.appendChild(sdom);
	return tdom;
}

HTMLDateEditor.prototype.getDateComponentDOM = function(parsed, ty, renderer){
	var self = this;
	if(["xsd:date", "xsd:dateTime", "xsd:gYear", "xsd:gYearMonth", "xsd:dateTimeStamp"].indexOf(ty) != -1){
		var ydom = document.createElement("input");
		ydom.setAttribute("class", "terminus-year-input terminus-year-"+ty);
		ydom.setAttribute("size", 6);
		ydom.setAttribute("placeholder", "YYYY");
		ydom.value = (parsed.year ? parsed.year : "");
		ydom.addEventListener("input", function(){
			self.set("year", this.value, renderer, ty);
		})
	}
	if(["xsd:date", "xsd:dateTime", "xsd:gYearMonth", "xsd:dateTimeStamp", "xsd:gMonth", "xsd:gMonthDay"].indexOf(ty) != -1){
		var mdom = document.createElement("select");
		mdom.setAttribute("class", "terminus-month-input terminus-month-"+ty);
		for(var i = 0; i<this.helper.months.length; i++){
			var opdom = document.createElement("option");
			opdom.value = i+1;
			opdom.appendChild(document.createTextNode(this.helper.months[i]));
			if(parsed.month && parsed.month == i+1){
				opdom.selected = true;
			}
			mdom.appendChild(opdom);
		}
		mdom.addEventListener("change", function(){
			self.set("month", this.value, renderer, ty);
		})
	}	
	if(["xsd:date", "xsd:dateTime", "xsd:dateTimeStamp", "xsd:gDay", "xsd:gMonthDay"].indexOf(ty) != -1){
		var ddom = document.createElement("input");
		ddom.setAttribute("class", "terminus-day-input terminus-day-"+ty);
		ddom.setAttribute("size", 2);
		ddom.setAttribute("placeholder", "DD");
		ddom.value = (parsed.day ? parsed.day : "");	
		ddom.addEventListener("input", function(){
			self.set("day", this.value, renderer, ty);
		})
	}	
	if(ydom || mdom || ddom){
		var dadom = document.createElement("span");
		if(ddom) dadom.appendChild(ddom); 
		if(mdom) {
			if(ddom) dadom.appendChild(document.createTextNode(this.date_spacer));
			dadom.appendChild(mdom); 
		}
		if(ydom) {
			if(mdom || ddom) dadom.appendChild(document.createTextNode(this.date_spacer));
			dadom.appendChild(ydom); 
		}
		return dadom;
	}
	return false;
}

module.exports={HTMLDateEditor}