function SimpleChooser(){}

SimpleChooser.prototype.options = function(options){
	this.options = options;
	this.show_single == (options && options.show_single ? options.show_single : false);
	this.empty_choice == (options && options.empty_choice ? options.empty_choice : false);
	this.change = (options && options.change ? options.change : function(val){console.log("chooser set to " + val)});
	return this;
}

SimpleChooser.prototype.render = function(){
	if(this.show_single == false && this.chooser.count() < 2) return false;
	if(this.show_empty == false && this.chooser.count() < 1) return false;
	var ccdom = document.createElement("span");
	ccdom.setAttribute("class", "woql-chooser");
	var ccsel = document.createElement("select");
	ccsel.setAttribute("class", " woql-chooser");
	var self = this;
	ccsel.addEventListener("change", function(){
		if(self.change)	self.change(this.value, this);
	});
	var opts = [];
	if(this.empty_choice){
		opts.push(this.getEmptyOption())
	}
	while(choice = this.chooser.next()){
		var opt = this.createOptionFromChoice(choice);
		opts.push(choice);
	}
	ccdom.appendChild(opts);
	ccdom.appendChild(ccsel);
	return ccdom;
}

SimpleChooser.prototype.getEmptyOption = function(){
	var choice = { id: "", label: this.empty_choice};
	return this.createOptionFromChoice(choice);
}

SimpleChooser.prototype.createOptionFromChoice = function(choice){
	var opt = document.createElement("option");
	opt.setAttribute("class", "terminus-woql-chooser-choice");
	opt.value = choice.id;
	if(choice.selected) opt.selected = true;
	if(typeof choice.label == "string"){
		opt.appendChild(document.createTextNode(choice.label));
	}
	else if(choice.label){
		opt.appendChild(choice.label);
	}
	if(choice.title){
		opt.setAttribute("title", choice.title);
	}
	return opt;
}

module.exports = SimpleChooser;