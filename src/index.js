const TerminusUI = require('./TerminusUI');
const RenderingMap = require('./client/RenderingMap');

var terminator = new TerminusUI(TerminusConfig);
var pconfig = {};
pconfig.buttons = {'client'   : document.getElementById("terminus-client-btn"),
				   'explorer' : document.getElementById("terminus-explorer-btn")}
pconfig.controller 	= document.getElementById("terminus-control-panel");
pconfig.messages = document.getElementById("terminus-user-messages");
pconfig.plugins = document.getElementById("terminus-plugin-loader");
pconfig.explorer = document.getElementById("terminus-explorer");
pconfig.viewer = document.getElementById("terminus-content-viewer");
var nlocation = (TerminusConfig && TerminusConfig.location) ? TerminusConfig.location : false;
terminator.draw(pconfig, nlocation);

function showPanel(mode){
	toggleHeaders(mode, document.getElementById("terminus-content-viewer"));
}
<<<<<<< HEAD

=======
*/
>>>>>>> 0fb098d8480b5632503565411487e001643c2a40
module.exports={TerminusUI:TerminusUI,
                RenderingMap:RenderingMap}