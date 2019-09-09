/*
 * Utility class which runs a query against the schema and presents the returned classes as a drop-down / class filter list
 */

TerminusClassChooser = function(ui, filter, chosen){
	this.ui = ui;
	this.choice = (chosen ? chosen : false);
	this.filter = filter;
	this.show_single = true;
}

TerminusClassChooser.prototype.setRoot = function(root){
	this.root = root;
}

TerminusClassChooser.prototype.setFilter = function(filter){
	this.filter = filter;
}

TerminusClassChooser.prototype.change = function(cls){
	alert("Need to specify class chooser function (" + cls + ")");
}

TerminusClassChooser.prototype.getAsDOM = function(){
	var ccdom = document.createElement("span");
	ccdom.setAttribute("class", "terminus-class-chooser");
	var ccsel = document.createElement("select");
	ccsel.setAttribute("class", "terminus-class-select terminus-type-select");
	var self = this;
	ccsel.addEventListener("change", function(){
		if(this.value != this.choice){
			this.choice = this.value;
			self.change(this.value);
		}
	});
	ccdom.appendChild(ccsel);
	var wq = new WOQLQuery(this.ui.client);
	var woql = wq.getClassListMetaDataQuery(this.filter);
	var self = this;
	wq.execute(woql)
	.then(function(response){
		var opts = self.getResultsAsOptions(response);
		if(opts){
			for(var i = 0; i<opts.length; i++){
				ccsel.appendChild(opts[i]);
			}
			self.options = opts;
		}
		else {
			ccdom.removeChild(ccsel);
		}
	});
	return ccdom;
}

TerminusClassChooser.prototype.getResultsAsOptions = function(clist){
	var choices = [];
	if(clist.bindings){
		if(this.show_single == false && clist.bindings.length < 2) return false;
		if(this.empty_choice){
			var opt1 = document.createElement("option");
			opt1.setAttribute("class", "terminus-class-choice terminus-empty-choice");
			opt1.value = "";
			opt1.appendChild(document.createTextNode(this.empty_choice));
			choices.push(opt1);
		}
		var added = [];
		for(var i = 0; i<clist.bindings.length; i++){
			if(clist.bindings[i].Class && added.indexOf(clist.bindings[i].Class) == -1){
				added.push(clist.bindings[i].Class);
				var opt = document.createElement("option");
				opt.setAttribute("class", "terminus-class-choice");
				opt.value = clist.bindings[i].Class;
				if(opt.value == this.choice){
					opt.selected = true;
				}
				var lab = clist.bindings[i].Label;
				if(!lab || lab == "unknown"){
					lab = FrameHelper.labelFromURL(clist.bindings[i].Class);
				}
				if(lab.data) lab = lab.data;
				opt.appendChild(document.createTextNode(lab));
				choices.push(opt);
			}
		}
	}
	return choices;
}
