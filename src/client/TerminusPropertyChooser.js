/*
 * Utility Property which runs a query against the schema and presents the returned Propertyes as a drop-down / Property filter list
 */

TerminusPropertyChooser = function(ui, filter){
	this.ui = ui;
	this.choice = false;
	this.filter = filter;
}

TerminusPropertyChooser.prototype.setRoot = function(root){
	this.root = root;
}

TerminusPropertyChooser.prototype.setFilter = function(filter){
	this.filter = filter;
}

TerminusPropertyChooser.prototype.change = function(cls){
	alert("Need to specify Property chooser function (" + cls + ")");
}

TerminusPropertyChooser.prototype.getAsDOM = function(){
	var ccdom = document.createElement("span");
	ccdom.setAttribute("Class", "terminus-Class-chooser");
	var ccsel = document.createElement("select");
	ccsel.setAttribute("Class", " terminus-type-select terminus-query-select");
	var self = this;
	ccsel.addEventListener("change", function(){
		if(this.value != this.choice){
			this.choice = this.value;
			self.change(this.value);
		}
	});
	ccdom.appendChild(ccsel);
	var wq = new WOQLQuery(this.ui.client);
	var woql = wq.getPropertyListQuery(this.filter);
	var self = this;
	wq.execute(woql)
	.then(function(response){
		var opts = self.getResultsAsOptions(response);
		for(var i = 0; i<opts.length; i++){
			ccsel.appendChild(opts[i]);
		}
	});
	return ccdom;
}

TerminusPropertyChooser.prototype.getResultsAsOptions = function(clist){
	var choices = [];
	if(this.empty_choice){
		var opt1 = document.createElement("option");
		opt1.setAttribute("Class", "terminus-class-choice terminus-empty-choice");
		opt1.value = "";
		opt1.appendChild(document.createTextNode(this.empty_choice));
		choices.push(opt1);
	}
	if(clist.bindings){
		var added = [];
		for(var i = 0; i<clist.bindings.length; i++){
			if(clist.bindings[i].Property && added.indexOf(clist.bindings[i].Property) == -1){
				added.push(clist.bindings[i].Property);
				var opt = document.createElement("option");
				opt.setAttribute("Class", "terminus-class-choice");
				opt.value = clist.bindings[i].Property;
				var lab = clist.bindings[i].Label;
				if(!lab || lab == "unknown"){
					lab = FrameHelper.labelFromURL(clist.bindings[i].Property);
				}
				if(lab["@value"]) lab = lab["@value"];
				opt.appendChild(document.createTextNode(lab));
				choices.push(opt);
			}
		}
	}
	return choices;
}
