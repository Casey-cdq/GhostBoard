const { remote } = require('electron')
var cm = require("../common")
const storage = require('electron-json-storage')

Mousetrap.bind('esc', () => { 
	console.log('esc')
	
	remote.getCurrentWindow().close()
})

function config_save(){
	console.log("config save.")

	cm.get_current_config(function(data){
		data.fontsize = $("#fontsize").val()

		cm.save_config(data, function() {
			remote.getGlobal("indexwindow").webContents.send('resetfont')
			remote.getGlobal("indexwindow").webContents.send('refreshboard')
    		remote.getCurrentWindow().close()
		});	
	})
	
}

function config_ready(){
	console.log("config_ready")
	
	$("#configsave").click(config_save)

	cm.get_current_config(function(data){
		$("#fontsize").attr("value",data.fontsize)
	})

	let dh = $("#board").height()
	let dw = $("#board").width()
	let cw = remote.getCurrentWindow()
	let bds = cw.getBounds()
	bds.y = window.screen.height/2 - dh/2
	// bds.x = window.screen.width/2 - dw/2
	bds.height = dh
	bds.width = dw
	cw.setBounds(bds)
}

$(document).ready(config_ready)