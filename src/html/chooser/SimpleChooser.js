function SimpleChooser(){}

SimpleChooser.prototype.options = function(options){
	this.options = options;
	return this;
}

SimpleChooser.prototype.render = function(chooser){
	if(chooser) this.chooser = chooser;
	if(this.chooser.config.show_empty() == false && this.chooser.count() < 1) return false;
	var ccdom = document.createElement("span");
	ccdom.setAttribute("class", "woql-chooser");
	var ccsel = document.createElement("select");
	ccsel.setAttribute("class", " woql-chooser");
	var self = this;
	ccsel.addEventListener("change", function(){
		self.chooser.set(this.value);
	});
	var opts = [];
	if(this.chooser.config.show_empty()){
		opts.push(this.getEmptyOption())
	}
	this.chooser.first();
	while(choice = this.chooser.next()){
		var opt = this.createOptionFromChoice(choice);
		opts.push(opt);
	}
	for(var i = 0; i<opts.length; i++){
		ccsel.appendChild(opts[i]);
	}
	ccdom.appendChild(ccsel);
	return ccdom;
}

SimpleChooser.prototype.getEmptyOption = function(){
	var choice = { id: "", label: this.chooser.config.show_empty()};
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