var Sentry = require('@sentry/electron');
Sentry.init({dsn: 'https://8338bd2b3e404d2f9eff2929ede6c9b0@sentry.io/1499274'});

const { remote } = require('electron')
var cm = require("../common")
const storage = require('electron-json-storage')
var online = require("./online")

function close_window(){
	remote.getCurrentWindow().close()
}

Mousetrap.bind('esc', () => { 
	close_window()
})

var span = '<i class="fa fa-angle-double-right pl-1"></i>'
function next_mkt(){
	let cu = $("#mkt").text()
	if (cu == "A股"){
		$("#mkt").html("港股"+span)
	}else if(cu == "港股"){
		$("#mkt").html("加密货币"+span)
	}else if(cu == "加密货币"){
		$("#mkt").html("外汇"+span)
	}else if(cu == "外汇"){
		$("#mkt").html("期货"+span)
	}else{
		$("#mkt").html("A股"+span)
	}
}

Mousetrap.bind('tab', () => { 
	next_mkt()
})

function sug_click(a){
	let sel_data = {}
	sel_data.key = $(a).attr("sugkey")

	cm.get_current_config(function(conf) {
		let data = conf.keys

	  	for (i in data){
	  		if (data[i]==sel_data.key){
	  			console.log("same key..")
	  			return
	  		}
	  	}

	  	console.log(sel_data.key)

		data.push(sel_data.key)

		conf.keys = data
		conf.mkt = $("#mkt").text()

		cm.save_config(conf, function() {
	    	console.log("set keys ok ")

	    	$("#sugin").val("")
	    	$("#sugin").focus()
	    	remote.getGlobal("indexwindow").webContents.send('refreshboard')

	    	let cd = $("#sug").children("a")
	    	cd.removeClass("d-block")
	    	cd.addClass("d-none")
	    	ret_window_height()
		});
	});
}

let the_current_req = undefined

function setup_sug(){
	// $('#sug').find("*").css("display","none")

	$("#sugin").on(" input propertychange",function(){
		key = $("#sugin").val()

	    if (typeof(the_current_req)!="undefined"){
			the_current_req.cancel("canceled")
		}
		let mkt_key = "@a"
		if ($("#mkt").text() == "港股"){
			mkt_key = "@hk"
		}else if($("#mkt").text() == "加密货币"){
			mkt_key = "@fc"
			key = "btc"+key
		}else if($("#mkt").text() == "外汇"){
			mkt_key = "@fc"
		}else if($("#mkt").text() == "期货"){
			mkt_key = "@nf"
		}

		the_current_req = online.sug(key+mkt_key,{},
			 function (message) {
		        // console.log("OK:"+JSON.stringify(message))
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
	cm.get_current_config(function(conf) {

		$("#mkt").html(conf.mkt+span)
		setup_sug()

		let dh = $("#board").height()
		let dw = $("#board").width()
		let cw = require('electron').remote.getCurrentWindow()
		let bds = cw.getBounds()
		bds.y = window.screen.height/2 - dh/2
		bds.x = window.screen.width/2 - dw/2
		bds.height = dh
		bds.width = dw
		cw.setBounds(bds)
		console.log(bds)
		$("#sugin").focus()

		$("#mkt").click(next_mkt)
		$("#close").click(close_window)
	})
}

$(document).ready(addnew_ready)