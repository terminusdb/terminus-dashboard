const FrameHelper = require('../FrameHelper');
const RenderingMap = require('../RenderingMap');

function HTMLDateHelper(){
	this.months = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
}

HTMLDateHelper.prototype.getMonthName = function(num){
	return this.months[num-1];
}

function HTMLDateViewer(options){
	this.max = (options && options.max ? options.max : false);
	this.min = (options && options.min ? options.min : false);
	this.allowbce = (options && options.allowbce ? options.allowbce : false);
	this.date_spacer = "/";
	this.time_spacer = ":";
	this.datetime_separator = ", ";
	this.helper = new HTMLDateHelper();
}

HTMLDateViewer.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-date");
	input.setAttribute('data-value', value);
	if(value){
		var parsed = FrameHelper.parseDate(ty, value);
		var datepart = this.getDateComponentDOM(parsed);
		var timepart = this.getTimeComponentDOM(parsed);
		if(timepart) input.appendChild(timepart);
		if(timepart && datepart) input.appendChild(document.createTextNode(this.datetime_separator));
		if(datepart) input.appendChild(datepart);
	}
	return input;
}

HTMLDateViewer.prototype.getTimeComponentDOM = function(parsed, ty){
	var hdom = (parsed.hour ? document.createElement("span") : false);
	if(hdom){
		hdom.setAttribute("class", "terminus-time-hour");
		hdom.appendChild(document.createTextNode(parsed.hour));
	}
	var mdom = (typeof parsed.minute != "undefined" ? document.createElement("span") : false);
	if(mdom){
		mdom.setAttribute("class", "terminus-time-minute");
		var mlab = (parsed.minute < 10 ? "0" + parsed.minute : parsed.minute);
		mdom.appendChild(document.createTextNode(mlab));
	}
	var sdom = (typeof parsed.second != "undefined" ? document.createElement("span") : false);
	if(sdom){
		sdom.setAttribute("class", "terminus-time-second");
		var slab = (parsed.second < 10 ? "0" + parsed.second : parsed.second);
		sdom.appendChild(document.createTextNode(slab));
	}
	var tz = (parsed.timezone ? document.createElement("span") : false);
	if(tz){
		sdom.setAttribute("class", "terminus-time-timezone");
		sdom.appendChild(document.createTextNode(parsed.timezone));
	}
	if(hdom || mdom || sdom || tz){
		var dadom = document.createElement("span");
		dadom.setAttribute("class", "terminus-time-components time-"+ty);
		if(hdom) dadom.appendChild(hdom); 
		if(mdom) {
			if(hdom) dadom.appendChild(document.createTextNode(this.time_spacer));
			dadom.appendChild(mdom); 
		}
		if(sdom) {
			if(mdom || hdom) dadom.appendChild(document.createTextNode(this.time_spacer));
			dadom.appendChild(sdom); 
		}
		if(tz){
			dadom.appendChild(document.createTextNode(" (Timezone: ")); 
			dadom.appendChild(sdom); 
			dadom.appendChild(document.createTextNode(")")); 			
		}
		return dadom;
	}
	return false;
}

HTMLDateViewer.prototype.getDateComponentDOM = function(parsed, ty){
	var ydom = (parsed.year ? document.createElement("span") : false);
	if(ydom){
		ydom.setAttribute("class", "terminus-date-year");
		ydom.appendChild(document.createTextNode(parsed.year));
	}
	var mdom = (parsed.month ? document.createElement("span") : false);
	if(mdom){
		mdom.setAttribute("class", "terminus-date-month");
		mdom.appendChild(document.createTextNode(this.helper.getMonthName(parsed.month)));		
	}
	var ddom = (parsed.day ? document.createElement("span") : false );
	if(ddom){
		ddom.setAttribute("class", "terminus-date-day");
		ddom.appendChild(document.createTextNode(parsed.day));		
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

function HTMLDateEditor(options){
	this.max = (options && options.max ? options.max : false);
	this.min = (options && options.min ? options.min : false);
	this.allowbce = (options && options.allowbce ? options.allowbce : false);
	this.date_spacer = "/";
	this.time_spacer = ":";
	this.datetime_separator = ", ";
	this.helper = new HTMLDateHelper();
}

HTMLDateEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-date");
	input.setAttribute('data-value', value);
	if(value){
		this.parsed = FrameHelper.parseDate(ty, value);
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
	var xsd = FrameHelper.xsdFromParsed(this.parsed, ty);
	if(xsd){
		renderer.set(xsd);
	}
}


HTMLDateEditor.prototype.getTimeComponentDOM = function(parsed, ty, renderer){
	
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
	if(["xsd:date", "xsd:dateTime", "xsd:dateTimeStamp", "xsd:gMonth", "xsd:gDay", "xsd:gMonthDay"].indexOf(ty) != -1){
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

RenderingMap.registerViewerForTypes("HTMLDateViewer", "Date Viewer", ["xsd:date", "xsd:dateTime", "xsd:gYear", 
	"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
RenderingMap.registerEditorForTypes("HTMLDateEditor", "Date Editor", ["xsd:date", "xsd:dateRange" ,"xsd:dateTime", "xsd:gYear", 
	"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
