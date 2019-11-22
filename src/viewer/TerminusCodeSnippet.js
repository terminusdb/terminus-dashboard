const TerminusClient = require('@terminusdb/terminus-client');
const UTILS= require('../Utils');

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
    this.result = document.createElement('div');
    this.result.setAttribute('class', 'terminus-snippet-results');
}

//View and submit button
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
            if(this.mode == 'view')
                this.snippet.appendChild(document.createTextNode(this.qObj.prettyPrint(this.qObj.query)));
            else{
                // replace text area with new format
                var currVal = this.snippet.value;
                var qObj = this.convertJs(currVal);
                this.snippet.value = qObj.prettyPrint(currVal);
            }
        break;
        case 'jsonld':
            if(this.mode == 'view')
                this.snippet.appendChild(document.createTextNode(JSON.stringify(this.qObj.query, undefined, 2)));
            else  {
                // replace text area with new format
                var currVal = this.snippet.value;
                var qObj = UTILS.getqObjFromInput(currVal);
                this.snippet.value = JSON.stringify(qObj.query, undefined, 2);
            }
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
    // query
    var snpc = document.createElement('div');
    snpc.setAttribute('style', 'display:table-caption; margin: 20px');
    if(this.placeholder)
		this.snippet.setAttribute("placeholder", this.placeholder);
    if(this.width && this.height)
		this.snippet.setAttribute("style", "width: "+ this.width +"px; height: "+ this.height + "px;");
    snpc.appendChild(this.getFormatButtons());
    if(this.qObj.query == 'undefined')
        this.snippet.appendChild(document.createTextNode(this.qObj.prettyPrint(this.qObj.query)));
    snpc.appendChild(this.snippet);
    var actbtn = this.getActionButtons();
    snpc.appendChild(actbtn);
    // results
    var sres = document.createElement('div');
    sres.appendChild(this.result);
    scont.appendChild(snpc);
    scont.appendChild(sres);
    snippet.dom = scont; // html dom
    snippet.actionButton = actbtn; // action button HTML obj
    snippet.snippetText = this.snippet; // text area HTML obj
    snippet.result = this.result; // result dom
    return snippet;
}

TerminusCodeSnippet.prototype.getAsDOM = function(){
    return this.getDOMParts();
}

module.exports = TerminusCodeSnippet;
