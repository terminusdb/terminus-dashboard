const TerminusClient = require('@terminusdb/terminus-client');

/*
qObj: WOQL object
width: width of snippet in px
height: height of snippet in px
*/
function TerminusCodeSnippet(qObj, width, height, placeholder, mode){
    this.qObj = qObj;
	this.width = width;
	this.height = height;
    this.placeholder = placeholder;
    this.format = ['javascript', 'jsonld'];
    this.mode = mode;
    if(this.mode == 'view')
        this.snippet = document.createElement('pre');
    else this.snippet = document.createElement('textarea');
}

TerminusCodeSnippet.prototype.getActionButtons = function(){
    var actbtn = document.createElement('button');
    actbtn.setAttribute('type', 'submit');
    if(this.mode == 'view')
        actbtn.appendChild(document.createTextNode(this.mode.charAt(0)
                                                       .toUpperCase()
                                                       + this.mode.slice(1)))
    else actbtn.appendChild(document.createTextNode('Submit'));
    return actbtn;
}

TerminusCodeSnippet.prototype.displayFormat = function(button){
    TerminusClient.FrameHelper.removeChildren(this.snippet);
    switch(button.value){
        case 'javascript':
            this.snippet.appendChild(document.createTextNode(this.qObj.prettyPrint(this.qObj.query)));
        break;
        case 'jsonld':
            this.snippet.appendChild(document.createTextNode(JSON.stringify(this.qObj.query, undefined, 2)));
        break;
        default:
            console.log('Invalid Format specified in TerminusCodeSnippet.js')
        break;
    }
}

TerminusCodeSnippet.prototype.getFormatButtons = function(){
    var bsp = document.createElement('span');
    for(var i=0; i<this.format.length; i++){
        var btn = document.createElement('button');
        btn.setAttribute('value', this.format[i]);
        btn.appendChild(document.createTextNode(this.format[i].charAt(0)
                                                    .toUpperCase()
                                                    + this.format[i].slice(1)));
        var self = this;
        btn.addEventListener('click', function(){
            self.displayFormat(this);
        })
        bsp.appendChild(btn);
    }
    return bsp;
}

TerminusCodeSnippet.prototype.getDOMParts = function(){
    var snippet = {};
    var scont = document.createElement('div');
    if(this.placeholder)
		this.snippet.setAttribute("placeholder", this.placeholder);
    if(this.width && this.height)
		this.snippet.setAttribute("style", "width: "+ this.width +"px; height: "+ this.height + "px;");
    scont.appendChild(this.getFormatButtons());
    if(Object.entries(this.qObj).length > 0)
        this.snippet.appendChild(document.createTextNode(this.qObj.prettyPrint(this.qObj.query)));
    scont.appendChild(this.snippet);
    var actbtn = this.getActionButtons();
    scont.appendChild(actbtn);
    snippet.dom = scont; // html dom
    snippet.actionButton = actbtn; // action button HTML obj
    snippet.snippetText = this.snippet; // text area HTML obj
    return snippet;
}

TerminusCodeSnippet.prototype.getAsDOM = function(){
    return this.getDOMParts();
}

module.exports = TerminusCodeSnippet;
