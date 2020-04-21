const UTILS = require("./Utils.js");
const HTMLHelper = require('./html/HTMLHelper');


function TerminusTutorialLoader(ui){
	this.ui = ui;
	this.tutorial_server = "https://terminusdb.github.io/terminus-tutorials/";
	this.fetchOptions();
	this.container = document.createElement("span");
	this.container.setAttribute("class", "terminus-main-page");
}

TerminusTutorialLoader.prototype.fetchOptions = function(){
	let self = this;
	let cback = function(){
		self.showTutorialChoices()
	}
	HTMLHelper.loadDynamicScript("tutorials", this.tutorial_server + "tutorials.js", cback);
}

TerminusTutorialLoader.prototype.drawChoices = function(){
	if(this.choices){
		for(var i = 0 ; i < this.choices.length; i++){
			this.showChoice(this.choices[i]);
		}
	}
}


TerminusTutorialLoader.prototype.showTutorialChoices = function(){
	this.choices = getTutorialOptions();
	this.drawChoices();
}


TerminusTutorialLoader.prototype.showChoice = function(choice){
	var hbox = document.createElement("div");
	hbox.setAttribute("class", "terminus-welcome-box terminus-no-res-alert");
	var ispan =  document.createElement("span");
	ispan.setAttribute("class", "terminus-db-widget");
	if(choice.css){
		var ic = document.createElement("i");
		ic.setAttribute("class", choice.css);
		ispan.appendChild(ic);
	}
	hbox.appendChild(ispan);
	var htit = document.createElement("span");
	htit.appendChild(document.createElement("strong").appendChild(document.createTextNode(choice.title)));
	htit.classList.add('terminus-welcome-title');
	hbox.appendChild(htit);
	var body = document.createElement("p");
	body.setAttribute('class', 'terminus-welcome-body');
	body.appendChild(document.createTextNode(choice.text));
	hbox.appendChild(body);
	let self = this
	hbox.addEventListener("click", function(){
		self.prepareDatabase(choice)
	});
	this.container.appendChild(hbox);	
}

TerminusTutorialLoader.prototype.getAsDOM = function(){
	HTMLHelper.removeChildren(this.container);
	this.drawChoices();
	return this.container;
}

TerminusTutorialLoader.prototype.prepareDatabase = function(choice){
	this.client.deleteDatabase(choice.id)
	.finally(()=>{
		this.ui.CreateDatabase(choice)
		.finally(()=>{
			this.loadTutorial(choice)
		})
	})
}

//also need to update the UI screen
TerminusTutorialLoader.prototype.loadTutorial = function(choice){
	let self = this;
	let cback = function(){
		self.startTutorial(choice, TerminusTutorial);
	}
	HTMLHelper.loadDynamicScript(choice.id, this.tutorial_server + choice.id + "/tutorial.js", cback);
}


TerminusTutorialLoader.prototype.showTutorialLaunchPage = function(choice, tutorialConfig){
	HTMLHelper.removeChildren(this.container);
	//alert(tid)	
	return this.container;
}

TerminusTutorialLoader.prototype.startTutorial = function(choice, tutorialConfig) {
	this.showTutorialLaunchPage(choice, tutorialConfig)
}

TerminusTutorialLoader.prototype.createSchema = function(OWLSchema){
    return this.client.updateSchema(OWLSchema)
}

TerminusTutorialLoader.prototype.insert = function(insertJSON){
    return this.client.woql(insertJSON)
}

TerminusTutorialLoader.prototype.query = function(selectWOQL){
    return this.client.woql(selectWOQL)
}

TerminusTutorialLoader.prototype.showTutorialStages = function(stages){
	//
	this.stages = []; 

    return this.client.woql(InsertJSON)
}

TerminusTutorialLoader.prototype.loadTutorialStage = function(stage){
	//

    return this.client.woql(InsertJSON)
}

function getNextStageButton(func){
    let but = document.createElement("button");
    but.appendChild(document.createTextNode("Next Step"))
    but.addEventListener("click", function(){
        func();
    })
    return but;
}

TerminusTutorialLoader.prototype.executeStage = function(func){
    let but = document.createElement("button");
    but.appendChild(document.createTextNode("Run Query"))
    but.addEventListener("click", function(){
        func();
    })
    return but;
}


TerminusTutorialLoader.prototype.showStageResult = function(q, v, complete){
    let vu = v || `let view = View.table()`;
    var rq = Viewer.getQueryPane(eval(q), eval(vu), false, false, {showQuery: false});
    let rd = rq.getAsDOM();
    rq.load();    
    return rd;
}


/**
 * 
 * @param {WOQLClient} client 
 * @param {String} id 
 * @param {String} title 
 * @param {String} description 

function createDatabase(id, title, description){
    title = title || "Seshat";
    description = description || "Seshat global history databank";
    const dbdetails = {
        "@context" : {
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            terminus: "http://terminusdb.com/schema/terminus#"
        },
        "@type": "terminus:Database",
        'rdfs:label' : { "@language":  "en", "@value": title },
        'rdfs:comment': { "@language":  "en", "@value": description},
        'terminus:allow_origin': { "@type" : "xsd:string", "@value" : "*" }
    };
    return WOQLclient.createDatabase(id, dbdetails);
}


 */

module.exports=TerminusTutorialLoader
