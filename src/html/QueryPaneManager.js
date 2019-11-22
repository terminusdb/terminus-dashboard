const TerminusClient = require('@terminusdb/terminus-client');
const TerminusHTMLViewer = require("../TerminusHTMLViewer");
const TerminusCodeSnippet = require('../viewer/TerminusCodeSnippet');
const QueryPane = require('../html/QueryPane');
const UTILS= require('../Utils');

function QueryPaneManager(ui){
    this.ui = ui;
    this.client = ui.client;
}

QueryPaneManager.prototype.addNewQuery = function(){
    var abtn = document.createElement('button');
    abtn.appendChild(document.createTextNode('New Query'));
    abtn.setAttribute('style', 'float:right');
    var self = this;
    abtn.addEventListener('click', function(){
        self.queryPane();
        //self.thv.queryPane.addQueryViewer(self.thv.queryViewer);
        self.qpane.addQueryViewer(self.thv.queryViewer);
    })
    return abtn;
}

QueryPaneManager.prototype.queryEditor = function(){
    var woql = TerminusClient.WOQL;
	var tcs = new TerminusCodeSnippet(woql, 500, 250, 'Enter Query ...', 'edit');
	var snippet = tcs.getAsDOM();
	return snippet;
}

QueryPaneManager.prototype.ruleEditor = function(){
    var woql = TerminusClient.WOQL;
	var tcs = new TerminusCodeSnippet({}, 300, 250, 'Enter Rules ...', 'edit');
	var snippet = tcs.getAsDOM();
	return snippet;
}

/*
    qObj: woql object
    woql:
*/
QueryPaneManager.prototype.processResults = function(qObj, woql, thv, results, snippet){
    let qres = new TerminusClient.WOQLResult(results, qObj);
    this.qres = qres;
    this.qpane.qres = qres;
    snippet.qres = qres;
    var nt = thv.showResult(qres, woql.table());
    snippet.result.appendChild(nt);
    qres.first()
    /*var n = thv.showResult(qres, woql.chooser());
    snippet.result.appendChild(n);
    qres.first();
    var ng = thv.showResult(qres, woql.graph());
    snippet.result.appendChild(ng);
    qres.first();*/
}

// rules
QueryPaneManager.prototype.showRuleEditor = function(woql, qSnippet){
    var snippet = this.ruleEditor();
    this.qpane.addRuleDom = snippet.actionButton;
    qSnippet.result.appendChild(document.createTextNode('Rule Editor'));
    qSnippet.result.appendChild(snippet.dom);
    var self = this;
    this.qpane.addRuleDom.addEventListener('click', function(){
        try{
            self.ui.clearMessages();
            var rObj = UTILS.getqObjFromInput(snippet.snippetText.value);
            //self.qpane.qres.first();
            qSnippet.qres.first();
            //var n = self.thv.showResult(self.qpane.qres, rObj);
            var n = self.thv.showResult(qSnippet.qres, rObj);
            // store rules per query
            self.qpane.addResultViewer(snippet.snippetText.value);
            qSnippet.result.appendChild(document.createTextNode('Results'))
            qSnippet.result.appendChild(n);
            qSnippet.result.appendChild(self.showConfig(woql, qSnippet));
        }
        catch(e){
            self.ui.showError('Error in rule editor: ' + e);
        }
    })
}

QueryPaneManager.prototype.showConfig = function(woql, qSnippet){
    var cbtn = document.createElement('button');
    cbtn.setAttribute('style', 'margin-top: 10px;')
    cbtn.appendChild(document.createTextNode('Add Rule'));
    qSnippet.result.appendChild(cbtn);
    var self = this;
    cbtn.addEventListener('click', function(){
        self.showRuleEditor(woql, qSnippet);
    })
    return cbtn;
}

QueryPaneManager.prototype.submitQuery = function(snippet){
    //let thv = new TerminusHTMLViewer(this.client);
    let WOQL = TerminusClient.WOQL;
    this.qpane.submitDom = snippet.actionButton;
    var self = this;
    this.qpane.submitDom.addEventListener('click', function(){
        try{
            //self.thv.queryPane.query = snippet.snippetText.value;
            self.qpane.query = snippet.snippetText.value;
            self.ui.clearMessages();
            let qObj = UTILS.getqObjFromInput(snippet.snippetText.value);
            qObj.execute(self.client).then((results) => {
                TerminusClient.FrameHelper.removeChildren(snippet.result);
                self.processResults(qObj, WOQL, self.thv, results, snippet);
                self.showConfig(WOQL, snippet);
                for(var i=0; i < self.qpane.result_viewers.length; i ++){
                    self.qres.first();
                    var rObj = UTILS.getqObjFromInput(self.qpane.result_viewers[i]);
                    var rt = self.thv.showResult(self.qres, rObj);
                    snippet.result.appendChild(rt);
                    //self.showConfig(WOQL, snippet.result);
                    self.showConfig(WOQL, snippet);
                }
            })
        }
        catch(e){
            self.ui.showError('Error in query editor' + e);
        }
    })
}

QueryPaneManager.prototype.queryPane = function(){
    this.qpane = new QueryPane(this.client);
    var cont = document.createElement('div');
    this.container.appendChild(cont);
    cont.appendChild(document.createTextNode('Enter New Query:'))
    cont.setAttribute('style', 'border: 1px solid grey; padding: 10px; margin:10px;background-color:antiquewhite');
    //query editor
    var snippet = this.queryEditor();
    cont.appendChild(snippet.dom);
    this.submitQuery(snippet);
    cont.appendChild(this.addNewQuery());
    return cont;
}

QueryPaneManager.prototype.getAsDOM = function(thv, qbox){
    this.thv = thv;
    this.container = qbox;
    return this.queryPane();
}

module.exports = QueryPaneManager;
