const QueryPane = require("./QueryPane");
const DocumentPane = require("./DocumentPane");

function TerminusViewer(client){
    this.client = client;
}

TerminusViewer.prototype.getDocumentPane = function(docid, docConfig, docPaneConfig){
    var dp = new DocumentPane(this.client, docid);
    dp.view = docConfig;
    if(docPaneConfig) dp.options(docPaneConfig);
    else dp.options(dp.defaultPaneView);
    return dp;   
}

TerminusViewer.prototype.getDocument = function(docid, docConfig, docJSON){
    return this.getDocumentPane(docid, docConfig);
}

TerminusViewer.prototype.getNewDocumentPane = function(cls, docConfig, docPaneConfig){
    var dp = new DocumentPane(this.client, false, cls);
    dp.view = docConfig;
    if(docPaneConfig) dp.options(docPaneConfig);
    else dp.options(dp.defaultPaneView);
    return dp;   
}


TerminusViewer.prototype.getQueryPane = function(query, resultConfigs, results, resultPaneConfigs, queryPaneConfig){
    var qp = new QueryPane(this.client, query, results);
    if(queryPaneConfig) qp.options(queryPaneConfig);
    else qp.options(qp.defaultQueryView);
    if(resultConfigs && resultConfigs.length){
        for(var i = 0 ; i < resultConfigs.length; i++){
            var rpc = (resultPaneConfigs && resultPaneConfigs[i] ? resultPaneConfigs[i] : qp.defaultResultView);
            qp.addView(resultConfigs[i], rpc);
        }
    }
    return qp;
}

TerminusViewer.prototype.getResult = function(query, resultConfig, results){
    return this.getQueryPane(query, [resultConfig], results);
}

module.exports = TerminusViewer;