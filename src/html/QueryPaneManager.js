const TerminusClient = require('@terminusdb/terminus-client');
const TerminusCodeSnippet = require('../viewer/TerminusCodeSnippet');
const QueryPane = require('../html/QueryPane');
const UTILS = require('../Utils');



function QueryPaneManager(ui, thv){
    this.ui = ui;
    this.thv = thv;
    this.client = ui.client;
    this.mode = 'edit';
}

/*********** Config ************/

/*
    descr: con click of submit config
    params: query object, query snippet, results snippet
*/
QueryPaneManager.prototype.submitConfigRules = function(woql, cSnippet, qSnippet, rSnippet){
    this.ui.clearMessages();
    var cObj = UTILS.getqObjFromInput(cSnippet.snippetText.value);
    TerminusClient.FrameHelper.removeChildren(rSnippet.result);
    //rSnippet.result.appendChild(this.addConfig(woql, qSnippet, rSnippet));
    rSnippet.rules = cSnippet.snippetText.value;
    qSnippet.qres.first();
    var n = this.thv.showResult(qSnippet.qres, cObj);
    rSnippet.result.appendChild(n);
}

/*
    descr: on click of Add View button
    params: query object, query snippet, results snippet
*/
QueryPaneManager.prototype.submitView = function(woql, qSnippet, rSnippet){
    this.ui.clearMessages();
    var rObj = UTILS.getqObjFromInput(rSnippet.snippetText.value);
    qSnippet.qres.first();
    var n = this.thv.showResult(qSnippet.qres, rObj);
    this.qpane.addResultViewer(rSnippet.snippetText.value);
    qSnippet.result.appendChild(UTILS.getHeaderDom('View:'));
    qSnippet.result.appendChild(n);
    //qSnippet.dom.appendChild(UTILS.getHeaderDom('View:'));
    //qSnippet.dom.appendChild(n);
    rSnippet.rules = rObj;
    //qSnippet.dom.appendChild(this.addConfig(woql, qSnippet, rSnippet));
    //qSnippet.result.appendChild(this.addConfig(woql, qSnippet, rSnippet));
    qSnippet.dom.appendChild(this.addView(woql, qSnippet));
}

QueryPaneManager.prototype.hideAddViewEditor = function(vd){
    vd.classList.remove('terminus-rule-editor');
    vd.classList.remove('erminus-rule-editor-border');
    //vd.classList.add('terminus-rule-editor-border');
    TerminusClient.FrameHelper.removeChildren(vd);
}

/*
    descr: Show results editor on click of Add View
    params: query object, query snippet
*/
QueryPaneManager.prototype.showRuleEditor = function(woql, vd, qSnippet){
    var cancel = document.createElement('icon');
    //cancel.appendChild(document.createTextNode('cancel'));
    cancel.setAttribute('class', 'fa fa-times terminus-pointer terminus-cancel-rule-editor');
    vd.appendChild(cancel);
    var rSnippet = this.thv.getEditor(1350, 250, 'Enter Rules ...');
    //var rEditor = document.createElement('div');
    vd.setAttribute('class', 'terminus-rule-editor');
    //vd.setAttribute('style', 'border: 1px solid orange');
    this.qpane.addRuleDom = rSnippet.actionButton;
    vd.appendChild(UTILS.getHeaderDom('Rule Editor:'));
    vd.appendChild(rSnippet.dom);
    qSnippet.dom.appendChild(vd);
    var self = this;
    cancel.addEventListener('click', function(){
        TerminusClient.FrameHelper.removeChildren(vd);
        self.addView(woql, qSnippet);
    })
    this.qpane.addRuleDom.addEventListener('click', function(){
        try{
            self.submitView(woql, qSnippet, rSnippet);
            self.hideAddViewEditor(vd);
        }
        catch(e){
            self.ui.showError('Error in rule editor: ' + e);
        }
    })
    return rSnippet;
}

/*********** Query ************/
/*
    descr: process results by default
*/
QueryPaneManager.prototype.processResults = function(qObj, woql, thv, results, snippet){
    let qres = new TerminusClient.WOQLResult(results, qObj);
    this.qres = qres;
    this.qpane.qres = qres;
    snippet.qres = qres;
    snippet.result.appendChild(UTILS.getHeaderDom('View:'));
    snippet.result.appendChild(document.createElement('BR'));
    var nt = thv.showResult(qres, woql.table());
    snippet.result.appendChild(nt);
    //snippet.result.appendChild(this.addDefaultConfig(woql, snippet));
    qres.first()
}

/*
    descr: Add new query pane
*/
QueryPaneManager.prototype.addNewQuery = function(){
    var abtn = document.createElement('button');
    abtn.setAttribute('class', 'terminus-btn terminus-new-query-btn');
    abtn.appendChild(document.createTextNode('New Query'));
    //abtn.setAttribute('style', 'float:right');
    var self = this;
    abtn.addEventListener('click', function(){
        self.queryPane();
        self.qpane.addQueryViewer(self.thv.queryViewer);
    })
    return abtn;
}

/*
    descr: Returns Add View button
    params: query object, query snippet
*/
QueryPaneManager.prototype.addView = function(woql, qSnippet){
    var vd = document.createElement('div');
    vd.setAttribute('class', 'terminus-add-view-editor');
    var cbtn = document.createElement('button');
    vd.appendChild(cbtn);
    cbtn.setAttribute('style', 'margin-top: 10px;');
    cbtn.setAttribute('class', 'terminus-btn');
    cbtn.appendChild(document.createTextNode('Add View'));
    qSnippet.result.appendChild(vd);
    var self = this;
    cbtn.addEventListener('click', function(){
        let editor = self.showRuleEditor(woql, vd, qSnippet);
    })
    return vd;
}

/*
    descr: On submit of query, generate results view according to previous rules
    params: query object, query snippet (with new query)
*/
QueryPaneManager.prototype.generateResultsFromRules = function(woql, qSnippet){
    for(var i=0; i < this.qpane.result_viewers.length; i ++){
        this.qres.first();
        var rObj = UTILS.getqObjFromInput(this.qpane.result_viewers[i]);
        var rt = this.thv.showResult(this.qres, rObj);
        qSnippet.result.appendChild(rt);
        this.addView(woql, qSnippet);
    }
}
/*
    descr: submit query
    params: query snippet
*/
QueryPaneManager.prototype.submitQuery = function(qSnippet){
    let WOQL = TerminusClient.WOQL;
    TerminusClient.FrameHelper.removeChildren(qSnippet.actionButton);
    qSnippet.actionButton.appendChild(document.createTextNode('Run'));
    this.qpane.submitDom = qSnippet.actionButton;
    var self = this;
    this.qpane.submitDom.addEventListener('click', function(){
        try{
            self.qpane.query = qSnippet.snippetText.value;
            self.ui.clearMessages();
            let qObj = UTILS.getqObjFromInput(qSnippet.snippetText.value);
            qObj.execute(self.client).then((results) => {
                TerminusClient.FrameHelper.removeChildren(qSnippet.result);
                self.processResults(qObj, WOQL, self.thv, results, qSnippet);
                self.addView(WOQL, qSnippet);
                self.generateResultsFromRules(WOQL, qSnippet);
            })
        }
        catch(e){
            self.ui.showError('Error in query editor' + e);
        }
    })
}

// new query pane
QueryPaneManager.prototype.queryPane = function(){
    this.qpane = new QueryPane(this.client);
    var cont = document.createElement('div');
    cont.setAttribute('class', 'terminus-query-pane-cont');
    this.container.appendChild(cont);
    cont.appendChild(UTILS.getHeaderDom('Enter New Query:'))
    //cont.setAttribute('style', 'border: 1px solid grey; padding: 10px; margin:10px;background-color:white');
    var snippet = this.thv.getEditor(1350, 250, 'Enter Query ...'); //query editor
    //tcs.submit = function(){
    	
    //}
    cont.appendChild(snippet.dom);
    this.submitQuery(snippet);
    cont.appendChild(this.addNewQuery());
    return cont;
}

QueryPaneManager.prototype.getAsDOM = function(qbox){
    this.container = qbox;
    return this.queryPane();
}

module.exports = QueryPaneManager;
