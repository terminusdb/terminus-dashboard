function Codemirror(text, format, config){
  this.textdom = text;
  this.mode = format;
  if(objectIsEmpty(config)) this.darkMode = config.darkMode;
  if(this.jsonldCheck(format)) this.mode = 'javascript';
}
// checks if a json object is empty
function objectIsEmpty(arg) {
  for (var item in arg) {
    return false;
  }
  return true;
}

function autocomplete(){
    var orig = CodeMirror.hint.javascript = function (cm) {
        var list = [];//"limit()","start()","triple()"];//Session.get(Template.strSessionDistinctFields) || [];
        var cursor = cm.getCursor();
        var currentLine = cm.getLine(cursor.line);
        var start = cursor.ch;
        var end = start;
        while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) ++end;
        while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
        var curWord = start != end && currentLine.slice(start, end);
        var regex = new RegExp('^' + curWord, 'i');
        var result = {
            list: (!curWord ? list : list.filter(function (item) {
                return item.match(regex);
            })).sort(),
            from: CodeMirror.Pos(cursor.line, start),
            to: CodeMirror.Pos(cursor.line, end)
        };
        return result;
    };
    // codeMirror.hint.sql is defined when importing codemirror/addon/hint/sql-hint
    // (this is mentioned in codemirror addon documentation)
    // Reference the hint function imported here when including other hint addons
    // or supply your own
   	//cm.replaceSelection(".");
    //codeMirror.showHint(cm, CodeMirror.hint.javascript, hintOptions);
}

/*
txtar    : editor is attached to textar
mode     : format for highlighting, ex: json, html etc.
editable : readOnly false/ nocursor is special value in code editor to set readonly true */
Codemirror.prototype.colorizeTextArea = function(dimensions){
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
        extraKeys           : {"Ctrl-F": "find",
                               //"Tab": "autocomplete",
                               "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
        refresh             : true,
        foldGutter          : true,
        gutters             : ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });
    editor.foldCode(CodeMirror.Pos(13, 0));
    if(false && !(objectIsEmpty(dimensions))){
      editor.setSize(dimensions.width, dimensions.height);
    }
    else this.setCodemirrorSize(editor, dimensions);
    editor.defaultCharWidth('20px');
    if(true || this.darkMode) editor.setOption("theme", 'erlang-dark');
    else editor.setOption("theme", 'neo');
    return editor;
} // colorizeTextArea()

/*
  set editor size according to screens
  editor : code mirror editor Object
  mode   : editor being viewed from schema/ doc/ query page*/
Codemirror.prototype.setCodemirrorSize = function(editor, dimensions){
  switch(dimensions){
    case 'query':
      editor.setSize('auto', '400');
    break;
    case 'schema':
      editor.setSize('auto', '1550');
    break;
    case 'document':
     editor.setSize('765', '500');
    break;
    case 'api-doc':
        editor.setSize('800', '500');
    break;
    case 'doc-json':
        editor.setSize('1410', 'auto');
    break;
    case 'doc-json-create':
        editor.setSize('1410', '500');
    break;
  } // switch(dimensions)
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
  if(true || this.darkMode)
      var theme = 'cm-s-erlang-dark';
  else var theme = 'cm-s-neo';
  this.textdom.setAttribute('class', 'CodeMirror CodeMirror-wrap ' + theme + ' terminus-wrap-text terminus-wrapper-height ');
  return this.textdom;
} // colorizePre()

Codemirror.prototype.jsonldCheck = function(format){
  if(format == 'jsonld') return true;
}

module.exports=Codemirror
