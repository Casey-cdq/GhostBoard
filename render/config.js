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

function draw_cols(){
	cm.get_current_config(function(data){
		let cols = data.col
		$("#cols").children().each(function(){
			let ck = $(this).attr("col_key")
			let index = cols.indexOf(ck);
			console.log(ck)
			if (index > -1) {
				$(this).css("color","green")
			}else{
				$(this).css("color","gray")
			}
		})
	})
}

function col_click(col){
	let ck = $(col).attr("col_key")
	cm.get_current_config(function(data){
		let cols = data.col
		let index = cols.indexOf(ck);
		if (index > -1) {
			cols.splice(index, 1);
		}else{
			cols.push(ck)
		}
		data.col = cols
		console.log(data.col)
		cm.save_config(data, function() {
			draw_cols()
			remote.getGlobal("indexwindow").webContents.send('resetfont')
		})
	})
}

function config_ready(){
	console.log("config_ready")
	draw_cols()
	
	$("#configsave").click(config_save)

	cm.get_current_config(function(data){
		$("#fontsize").attr("value",data.fontsize)
	})

	let dw = $("#board")[0].scrollWidth
	let dh = $("#board")[0].scrollHeight
	let cw = remote.getCurrentWindow()
	let x = Math.round(window.screen.width/2 - dw/2)
	let y = Math.round(window.screen.height/2 - dh/2)
	cw.setBounds({x:x,height:dh,width:dw})
}

$(document).ready(config_ready)