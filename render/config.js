var Sentry = require('@sentry/electron');
Sentry.init({dsn: 'https://8338bd2b3e404d2f9eff2929ede6c9b0@sentry.io/1499274'});

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

		let model = $("#model").children(".active").children('input').first().attr("id")
		data.model = model

		cm.save_config(data, function() {
			remote.getGlobal("indexwindow").webContents.send('reload_fromconf')
    		remote.getCurrentWindow().close()
		});	
	})
	
}

function draw_cols(){
	cm.get_current_config(function(data){
		let cols = data.col
		$("#cols").children("li").each(function(){
			let ck = $(this).attr("col_key")+"|"+$(this).text()
			let index = cols.indexOf(ck)
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
	let ck = $(col).attr("col_key")+"|"+$(col).text()
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

			console.log("col_click>>>>>>")
			remote.getGlobal("indexwindow").webContents.send('reload_fromconf')
		})
	})
}

function config_restore(){
	cm.save_config({}, function() {
		remote.getGlobal("indexwindow").webContents.send('reload_fromconf')
		remote.getCurrentWindow().close()
	});	
}

function config_ready(){
	console.log("config_ready")
	draw_cols()
	
	$("#configsave").click(config_save)
	$("#configrestore").click(config_restore)

	cm.get_current_config(function(data){
		$("#fontsize").attr("value",data.fontsize)

		if(data.model==="nm"){
			console.log("model is nm.do nothing.")
		}else{
			$("#nm").parent().removeClass("active")
			$("#sm").parent().addClass("active")
		}
	})

	let dw = $("#board")[0].scrollWidth
	let dh = $("#board")[0].scrollHeight
	let cw = remote.getCurrentWindow()
	let x = Math.round(window.screen.width/2 - dw/2)
	let y = Math.round(window.screen.height/2 - dh/2)
	cw.setBounds({x:x,y:y,height:dh,width:dw})
}

$(document).ready(config_ready)