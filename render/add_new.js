const { remote } = require('electron')
var cm = require("../common")
const storage = require('electron-json-storage')

Mousetrap.bind('esc', () => { 
	console.log('esc')
	
	remote.getCurrentWindow().close()
})

Mousetrap.bind('tab', () => { 
	let cu = $("#mkt").text()
	if (cu == "A股"){
		$("#mkt").text("港股")
	}else{
		$("#mkt").text("A股")
	}
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

function sug_click(a){
	let sel_data = {}
	sel_data.key = $(a).attr("sugkey")

	const storage = require('electron-json-storage')
	storage.get('keys', function(error, data) {
			if (error) throw error

			if(JSON.stringify(data) == '{}'){
		    	data = []
		  	}

		  	for (i in data){
		  		if (data[i]==sel_data.key){
		  			console.log("same key..")
		  			return
		  		}
		  	}

		data.push(sel_data.key)

		storage.set('keys', data, function(error) {
	    	if (error) throw error;

	    	console.log("set keys ok ")

	    	$("#sugin").val("")
	    	$("#sugin").focus()
	    	remote.getGlobal("indexwindow").webContents.send('refreshboard')
		});
	});
}

let the_current_req = undefined

function setup_sug(){
	// $('#sug').find("*").css("display","none")

	$("#sugin").on(" input propertychange",function(){
		console.log("change "+$("#sugin").val())

	    if (typeof(the_current_req)!="undefined"){
			the_current_req.abort()
		}
		let mkt_key = "@a"
		if ($("#mkt").text() == "港股"){
			mkt_key = "@hk"
		}
		let url = encodeURI(cm.base_url+"/sug?key="+$("#sugin").val()+mkt_key)
		console.log("URL:"+url)

		the_current_req = cm.get(url,{},
			 function (message) {
		        console.log("OK:"+JSON.stringify(message))
		        // {"value":[{"code":"000006","name":"地产指数","key":"000006@a"},{"code":"000006","name":"深振业A","key":"000006@a"},{"code":"159916","name":"深F60ETF","key":"159916@a"},{"code":"399701","name":"深证F60","key":"399701@a"},{"code":"399697","name":"中关村60","key":"399697@a"}]}
				let vis = $("#sug").find("a.d-block")
				vis.removeClass("d-block")
				vis.addClass("d-none")

		        let v = message.value
		        for (i in v){
		        	let it = v[i]
		        	let cd = $("#sug").children("a")
		        	let tmp = $(cd[i])
		        	if (typeof(the_current_req)!="undefined"){
		        		tmp.text(it.code + " "+it.name)
		        		tmp.attr("sugkey",it.key)
		        		tmp.removeClass("d-none")
		        		tmp.addClass("d-block")
		        	}
		        }

		        ret_window_height()

		        the_current_req = undefined
		    },
		    function (message,einfo) {
		        console.log("NOTOK:"+JSON.stringify(message))

		        the_current_req = undefined
		    }
		)
	})
}

function ret_window_height(){
	let dh = $("#board").height()
	let dw = $("#board").width()

	let cw = require('electron').remote.getCurrentWindow()
	cw.setBounds({ height: dh ,width:dw})
}

function addnew_ready(){
	console.log("addnew_ready")
	setup_sug()
	get_current_config(function(data){
		// $("#fontsize").attr("value",data.fontsize)
	})

	ret_window_height()
}

$(document).ready(addnew_ready)