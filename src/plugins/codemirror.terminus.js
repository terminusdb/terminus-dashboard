function Codemirror(text, format, config){
  this.textdom = text;
  this.mode = format;
  this.darkMode = config.darkMode;
  if(this.jsonldCheck(format)) this.mode = 'javascript';
}

/*
txtar    : editor is attached to textar
mode     : format for highlighting, ex: json, html etc.
editable : readOnly false/ nocursor is special value in code editor to set readonly true */
Codemirror.prototype.colorizeTextArea = function(mode){
    //initize auto complete
    /*CodeMirror.commands.autocomplete = function(cm) {
    cm.showHint({hint: CodeMirror.hint.anyword});
    }*/

    // initialise code editor on text area
    var editor = CodeMirror.fromTextArea(this.textdom, {
        mode                : this.mode,
        firstLineNumber     : 1,
        lineNumbers         : true,
        styleActiveLine     : true,
        lineWrapping        : true,
        smartIndent         : true,
        indentWithTabs      : true,
        newlineAndIndent    : true,
        autoCloseBrackets   : true,
        matchBrackets       : {afterCursor: true},
        extraKeys           : {"Ctrl-F": "find", "Tab": "autocomplete" },
        refresh             : true
    });

    this.setCodemirrorSize(editor, mode);
    editor.defaultCharWidth('20px');
    if(this.darkMode) editor.setOption("theme", 'erlang-dark');
    else editor.setOption("theme", 'neo');

    return editor;
} // colorizeTextArea()

/*
  set editor size according to screens
  editor : code mirror editor Object
  mode   : editor being viewed from schema/ doc/ query page*/
Codemirror.prototype.setCodemirrorSize = function(editor, mode){
  switch(mode){
    case 'query':
      editor.setSize('800', '400');
    break;
    case 'schema':
      editor.setSize('1200', '1550');
    break;
    case 'document':
     editor.setSize('765', '500');
    break;
    case 'api-doc':
        editor.setSize('800', '500');
    break;
  } // switch(mode)
} // setCodemirrorSize()

// updateTextArea(): highlights new changes on editor
Codemirror.prototype.updateTextArea = function(editor){
  editor.save();
  setTimeout(function() {
      editor.refresh();
  },1);
  // save changes of code mirror editor
  editor.on('change', function(){
    editor.save();
  });
} //updateTextArea()

/*
colorizePre() to colorise pre tags (read only mode)
text (string)    : The document to run through the highlighter.
mode (mode spec) : format to highlight color
output (DOM node): The tokens will be converted to spans as in an editor,
                   and inserted into the node (through innerHTML).*/
Codemirror.prototype.colorizePre = function(){
  CodeMirror.runMode(this.textdom.innerText, this.mode, this.textdom);
  if(this.darkMode)
      var theme = 'cm-s-erlang-dark';
  else var theme = 'cm-s-neo';
  this.textdom.setAttribute('class', 'CodeMirror CodeMirror-wrap ' + theme + ' terminus-wrap-text terminus-wrapper-height ');
  return this.textdom;
} // colorizePre()

Codemirror.prototype.jsonldCheck = function(format){
  if(format == 'jsonld') return true;
}

module.exports=Codemirror
