function S2EntityEditor(options){}

S2EntityEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var cls = renderer.frame.range;
	var cback = renderer.set;
	var ctl = renderer.getController();
	var d2ch = new TerminusDocumentChooser(ctl.ui, cls, value);
	d2ch.change = function(val){
		renderer.set(val);
	}
	d2ch.view = "label";
	var d2dom = d2ch.getAsDOM();
	return d2dom;
}

TerminusDashboard.RenderingMap.registerEditorForFrameType("S2EntityEditor", "S2 Autocomplete Selector", "document");

