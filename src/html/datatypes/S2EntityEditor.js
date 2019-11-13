function S2EntityEditor(options){}

S2EntityEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var cls = frame.range();
	var cback = frame.set;
	var ctl = dataviewer.getClient();
	var d2ch = new TerminusDocumentChooser(ctl, cls, value);
	d2ch.change = function(val){
		frame.set(val);
	}
	d2ch.view = "label";
	var d2dom = d2ch.getAsDOM();
	return d2dom;
}


module.exports={S2EntityEditor}