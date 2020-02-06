const DateHelper = require('./DateHelper');
const TerminusClient = require('@terminusdb/terminus-client');

function HTMLDateViewer(options){
	this.options(options);
}

HTMLDateViewer.prototype.options = function(options){
	this.max = (options && options.max ? options.max : false);
	this.min = (options && options.min ? options.min : false);
	this.allowbce = (options && options.allowbce ? options.allowbce : false);
	this.date_spacer = "/";
	this.time_spacer = ":";
	this.datetime_separator = ", ";
	this.helper = new DateHelper.HTMLDateHelper();
}

HTMLDateViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLDateViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}

HTMLDateViewer.prototype.render = function(value){
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-date");
	input.setAttribute('data-value', value);
	if(value){
		var parsed = TerminusClient.UTILS.DateHelper.parseDate(this.type, value);
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
		var mlab = (parsed.minute < 10 ? parsed.minute : parsed.minute);
		mdom.appendChild(document.createTextNode(mlab));
	}
	var sdom = (typeof parsed.second != "undefined" ? document.createElement("span") : false);
	if(sdom){
		sdom.setAttribute("class", "terminus-time-second");
		var slab = (parsed.second < 10 ? parsed.second : parsed.second);
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

module.exports={HTMLDateViewer}