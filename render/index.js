var cm = require("../common")
const storage = require('electron-json-storage')
const defaultDataPath = storage.getDefaultDataPath()
console.log(defaultDataPath)

var the_current_req = undefined

function gb_chart(ev){
	key = ev.data
	const { BrowserWindow } = require('electron').remote
	  conf = {}
	  conf.fullscreenable = false
	  conf.fullscreen = false
	  conf.width = 1200
	  conf.height = 600
	  conf.show = false
	  conf.alwaysOnTop = true
	  conf.title = "幽灵看盘"
	  conf.frame = false
	  conf.opacity = 1.0
	  conf.resizable = true
	  conf.useContentSize = true
	  conf.minimizable = false
	  conf.maximizable = false
	  conf.webPreferences = {nodeIntegration:true}
	  // conf.transparent = true

	  // 创建浏览器窗口。
	  win = new BrowserWindow(conf)

	  // 然后加载应用的 index.html。
	  win.loadFile('render/gbchart.html',{query:{key:key}})

	  // 打开开发者工具
	  win.webContents.openDevTools()
	  win.once('ready-to-show', () => {
	    win.show()
	  })

	  // 当 window 被关闭，这个事件会被触发。
	  win.on('closed', () => {
	    // 取消引用 window 对象，如果你的应用支持多窗口的话，
	    // 通常会把多个 window 对象存放在一个数组里面，
	    // 与此同时，你应该删除相应的元素。
	    win = null
	  })
}

function gb_delete_row(ev){
	console.log("delete click")
	console.log(ev)
	key = ev.data
	storage.get('keys', function(error, data) {
			if (error) throw error
			let new_data = []
		  	for (i in data){
		  		if (data[i]!=key){
		  			new_data.push(data[i])
		  		}
		  	}

			storage.set('keys', new_data, function(error) {
		    	if (error) throw error;

		    	request_keys_and_set_timer(false)

				let gbrow = $("#gbrow")
				gbrow.children("tr[id='"+key+"']").remove()

		    	console.log("delete keys ok ")
		    	ret_window_height()
			});
	});
}

function gb_top_row(ev){
	key = ev.data
	storage.get('keys', function(error, data) {
			if (error) throw error
			let new_data = []
		  	new_data.push(key)
		  	for (i in data){
		  		if (data[i]!=key){
		  			new_data.push(data[i])
		  		}
		  	}

			storage.set('keys', new_data, function(error) {
		    	if (error) throw error;

		    	request_keys_and_set_timer(true)
		    	console.log("top key ok ")
			});
	});
}

function gb_add_row(key,row){
	console.log("add key :"+key)
	let row_all = $('<tr></tr>')
	for ( k in row){
		td = $('<td class="px-1 py-1">-</td>')
		td.attr("id",k)
		row_all.append(td)
	}

	let bts = $('<div></div>')
	// bts.addClass("btn-group")
	bts.addClass("collapse")
	bts.css("margin-left",-200)
	bts.css("-webkit-transition","none")
	bts.addClass("position-absolute")

	let bttext = '<button type="button" class="btn btn-primary btn-sm px-0 py-0"></button>'

	// let chart = $(bttext).text('分时')
	// chart.click(key,gb_chart)
	// chart.attr("id","chart_"+key)
	// chart.prop('disabled',true)
	// bts.append(chart)

	let top_bt = $(bttext).text('置顶')
	top_bt.click(key,gb_top_row)
	bts.append(top_bt)

	let del_bt = $(bttext).text('删除')
	del_bt.addClass("ml-1")
	del_bt.click(key,gb_delete_row)
	bts.append(del_bt)

	row_all.append(bts)

	// row_all.addClass("row")
	row_all.attr("id",key)

	let gbrow = $("#gbrow")
	gbrow.append(row_all)

	the_tr = gbrow.children("tr[id='"+key+"']")

	the_tr.mouseenter(function(){
    	console.log("in " + key)
    	$(this).find('.collapse').collapse('show')
 	});

 	the_tr.mouseleave(function(){
    	console.log("out " + key)
    	$(this).find('.collapse').collapse('hide')
 	});
}


function gb_set_row(key,row,row_data){

	for (let k in row_data){
		let t = row.children("td[id='"+k+"']")
		t.text(row_data[k])
	}

	// let cbt = row.find("button[id='chart_"+key+"']")
	// cbt.prop('disabled',false)
}

function ret_window_height(){
	let cw = require('electron').remote.getCurrentWindow()

	let dw = $("#board")[0].scrollWidth
	let dh = $("#board")[0].scrollHeight
	// console.log(dw+","+dh)
	// console.log($("#board").width()+","+$("#board").height())
	cw.setBounds({ width:dw,height: dh})

	// cw.setBounds({ height: dh})
}

function add_new(){
	console.log("add click")

	$("#addnew").addClass("disabled")

	const { BrowserWindow } = require('electron').remote
	conf = {}
	conf.fullscreenable = false
	conf.fullscreen = false
	conf.x = window.screen.width/2 - 540/2
	conf.y = window.screen.height/2 - 38/2
	conf.width = 540
	conf.height = 38
	conf.show = false
	conf.alwaysOnTop = true
	conf.title = "幽灵看盘"
	conf.frame = false
	conf.opacity = 1.0
	conf.resizable = false
	conf.useContentSize = true
	conf.minimizable = false
	conf.maximizable = false
	conf.webPreferences = {nodeIntegration:true}
	// conf.transparent = true

	// 创建浏览器窗口。
	win = new BrowserWindow(conf)

	// 然后加载应用的 index.html。
	win.loadFile('render/add_new.html')

	// 打开开发者工具
	// win.webContents.openDevTools({ mode: 'detach' })
	win.once('ready-to-show', () => {
		win.show()
	})

	// 当 window 被关闭，这个事件会被触发。
	win.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		win = null
		$("#addnew").removeClass("disabled")
	})
}

function add_new_cleanup(){
	$("#newboard").collapse('toggle')
	request_keys_and_set_timer(false)
}

function help(){
	cm.open_url("http://help")
}

function config(){
	console.log("config click")

	$("#config").addClass("disabled")

	const { BrowserWindow } = require('electron').remote
	conf = {}
	conf.fullscreenable = false
	conf.fullscreen = false
	conf.width = 410
	conf.height = 100
	conf.x = window.screen.width/2 - conf.width/2
	conf.y = window.screen.height/2 - conf.height/2
	conf.show = false
	conf.alwaysOnTop = true
	conf.title = "幽灵看盘"
	conf.frame = false
	conf.opacity = 1.0
	conf.resizable = false
	conf.useContentSize = true
	conf.minimizable = false
	conf.maximizable = false
	conf.webPreferences = {nodeIntegration:true}
	// conf.transparent = true

	// 创建浏览器窗口。
	win = new BrowserWindow(conf)

	// 然后加载应用的 index.html。
	win.loadFile('render/config.html')

	// 打开开发者工具
	win.webContents.openDevTools({ mode: 'detach' })
	win.once('ready-to-show', () => {
	win.show()
	})

	// 当 window 被关闭，这个事件会被触发。
	win.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		win = null
		$("#config").removeClass("disabled")
	})
}

function info(){
	cm.open_url("http://info")
}

function request_keys_and_set_timer(emp){

	storage.get('keys', function(error, data) {
		if (error) throw error;

		let watch_keys = []

		if(JSON.stringify(data) == '{}'){
			watch_keys.push("sh@a")
		}else{
			for (i in data){
				if(typeof(data[i])=="string"){
					watch_keys.push(data[i])
				}else{
					console.log("type="+typeof(data[i]))
				}
			}
		}

		delay = 10000

		let keys = watch_keys

		if (typeof(the_current_req)!="undefined"){
			the_current_req.abort()
		}

		the_current_req = cm.post(cm.base_url,keys,
			 function (message) {
		        // console.log("OK:"+JSON.stringify(message))
		        gbrow = $("#gbrow")
		        if (emp){
		        	gbrow.empty()
		        }

		        let added = false

		        for (i in message){
		        	v = message[i]
		        	row_td = gbrow.children("tr[id='"+v.key+"']")
		        	if (row_td.length==0){
		        		gb_add_row(v.key,{name:v.name,code:v.code,price:v.price})
		        		added = true
		        	}

		        	row_td = gbrow.children("tr[id='"+v.key+"']")
		        	gb_set_row(v.key,row_td,{name:v.name,code:v.code,price:v.price})
		        }

		        if (added){
		        	ret_window_height()
		        }

		        the_current_req = undefined
		    },
		    function (message) {
		        console.log("NOTOK:"+JSON.stringify(message))

		        the_current_req = undefined
		    }
		)

	});

}

function reset_font(){
	cm.get_current_config(function(data){
		$("#board").css("font-size",Number(data.fontsize))

		let cw1 = require('electron').remote.getCurrentWindow()
		cw1.setBounds({ width:100})

		$(window).resize(function(){
			let cw = require('electron').remote.getCurrentWindow()
			let dw = $("#board")[0].scrollWidth
			let dh = $("#board")[0].scrollHeight
			console.log(dw+","+dh)
			console.log($("#board").width()+","+$("#board").height())
			cw.setBounds({ width:dw,height: dh})
		})
	})
}

function ready_func(){
	reset_font()

	$("#addnew").click(add_new)
	$("#help").click(help)
	$("#config").click(config)
	$("#info").click(info)

	console.log("doc ready.")

	//start request and timer...
	request_keys_and_set_timer(false)
	window.setInterval(request_keys_and_set_timer,5000,false)
}

const { ipcRenderer } = require('electron')
ipcRenderer.on('refreshboard', (event, arg) => {
  request_keys_and_set_timer(false)
})

ipcRenderer.on('resetfont', (event, arg) => {
  reset_font()
})

$(document).ready(ready_func)