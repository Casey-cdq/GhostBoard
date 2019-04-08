const { remote } = require('electron')
var cm = require("../common")
const storage = require('electron-json-storage')

Mousetrap.bind('esc', () => { 
	console.log('esc')
	
	remote.getCurrentWindow().close()
})

function get_current_config(func){
	storage.get("config",function(error,data){
		if (error) throw error;

		if(JSON.stringify(data)=="{}"){
			//default config
			data.fontsize = "16"
		}

		func(data)
	})
}

function config_save(){
	console.log("config save.")

	new_config = {}
	new_config.fontsize = $("#fontsize").val()

	get_current_config(function(data){
		new_conf_json = JSON.stringify(new_config)
		old_conf_json = JSON.stringify(data)

		console.log(new_conf_json)
		console.log(old_conf_json)

		if (new_conf_json == old_conf_json){
			console.log("config not change")
			
			remote.getCurrentWindow().close()

			return
		}else{
			console.log("config changed.update and save.")
		}
	})	
}

function config_ready(){
	console.log("config_ready")
	
	$("#configsave").click(config_save)

	get_current_config(function(data){
		$("#fontsize").attr("value",data.fontsize)
	})
}

$(document).ready(config_ready)