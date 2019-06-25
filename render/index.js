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
	key = ev.data
	cm.get_current_config(function(conf) {
			let data = conf.keys
			let new_data = []
		  	for (i in data){
		  		if (data[i]!=key){
		  			new_data.push(data[i])
		  		}
		  	}
		  	conf.keys = new_data

			cm.save_config(conf, function() {
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
	cm.get_current_config(function(conf) {
		let data = conf.keys
		let new_data = []
	  	new_data.push(key)
	  	for (i in data){
	  		if (data[i]!=key){
	  			new_data.push(data[i])
	  		}
	  	}
	  	conf.keys = new_data
		cm.save_config(conf, function() {

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

	let colhead = $("#colhead")

	let bts = $('<div></div>')
	// bts.addClass("btn-group")
	bts.addClass("collapse")
	bts.css("margin-left",-colhead.width()+10)
	bts.css("height",colhead.height())
	bts.css("-webkit-transition","none")
	bts.addClass("position-absolute")

	let bttext = '<a href="#"></a>'

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
    	// console.log("in " + key)
    	$(this).find('.collapse').collapse('show')
 	});

 	the_tr.mouseleave(function(){
    	// console.log("out " + key)
    	$(this).find('.collapse').collapse('hide')
 	});
}


function gb_set_row(key,row,row_data){

	let per = row_data.per
	let pn = 0.0
	if(typeof(per)!="undefined"){
		pn = Number(per.split("%")[0])
	}

	for (let k in row_data){
		let t = row.children("td[id='"+k+"']")
		t.text(row_data[k])
		if(k=="name"|k=="per"){
			if (pn>0.0){
				t.css('color','red')
			}else if(pn<0.0){
				t.css('color','green')
			}else{
				t.css('color','gray')
			}
		}
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

function vcol_from_col(v,col){
	let ret = {}
	ret.name = v.name
	ret.per = v.per

	for (c in col){
		let key = col[c].split("|")[0]
		ret[key] = v[key]
	}

	return ret
}

function reset_cols(){
	cm.get_current_config(function(data) {
		let col_keys = ["name|股票名","per|涨跌幅"]
		col_keys = col_keys.concat(data.col)
		let alin = []
		$("#colhead").children().each(function(){
			let ck = $(this).attr("col_key")+"|"+$(this).text()
			let index = col_keys.indexOf(ck);
			if (index > -1) {
				alin.push(ck)
			}else{
				$(this).remove()
			}
		})
		
		for(i in col_keys){
			let c = col_keys[i]
			let index = alin.indexOf(c)
			if (index > -1) {
			}else{
				let key = c.split("|")[0]
				let name = c.split("|")[1]
				let t = '<th col_key="'+key+'" class="px-1 py-1" scope="col">'+name+'</th>'
				$("#colhead").append($(t))
			}
		}

		reset_font()
		request_keys_and_set_timer(true)
		
	})
}

function request_keys_and_set_timer(emp){

	cm.get_current_config(function(data) {

		let watch_keys = []
		for (i in data.keys){
			if(typeof(data.keys[i])=="string"){
				watch_keys.push(data.keys[i])
			}else{
				console.log("type="+typeof(data.keys[i]))
			}
		}

		let keys = watch_keys

		if (typeof(the_current_req)!="undefined"){
			the_current_req.abort()
			console.log("-----------abort last request----------")
		}

		the_current_req = cm.post(cm.base_url,keys,
			 function (message) {
		        console.log("OK:"+JSON.stringify(message))
		        gbrow = $("#gbrow")
		        if (emp){
		        	gbrow.empty()
		        }

		        let added = false

		        for (i in message){
		        	v = message[i]
		        	v_col = vcol_from_col(v,data.col)
		        	row_td = gbrow.children("tr[id='"+v.key+"']")
		        	if (row_td.length==0){
		        		gb_add_row(v.key,v_col)
		        		added = true
		        	}

		        	row_td = gbrow.children("tr[id='"+v.key+"']")
		        	gb_set_row(v.key,row_td,v_col)
		        }

		        ret_window_height()

		        the_current_req = undefined
		    },
		    function (message) {
		        // console.log("NOTOK:"+JSON.stringify(message))

		        the_current_req = undefined
		    }
		)

	});

}

function reset_font(func){
	cm.get_current_config(function(data){
		$("#board").css("font-size",Number(data.fontsize))

		let cw1 = require('electron').remote.getCurrentWindow()
		cw1.setBounds({ width:80})

		$(window).resize(function(){
			let cw = require('electron').remote.getCurrentWindow()
			let dw = $("#board")[0].scrollWidth
			let dh = $("#board")[0].scrollHeight
			// console.log(dw+","+dh)
			// console.log($("#board").width()+","+$("#board").height())
			cw.setBounds({ width:dw,height: dh})

			if (typeof(func)!="undefined"){
				func()
			}
		})
	})
}

function ready_func(){
	// reset_font()
	reset_cols()

	$("#addnew").click(add_new)
	$("#help").click(help)
	$("#config").click(config)
	$("#info").click(info)

	console.log("doc ready.")

	//start request and timer...
	// request_keys_and_set_timer(false)
	window.setInterval(request_keys_and_set_timer,10000,false)
}

const { ipcRenderer } = require('electron')
ipcRenderer.on('refreshboard', (event, arg) => {
  request_keys_and_set_timer(false)
})

ipcRenderer.on('resetfont', (event, arg) => {
  reset_font()
})

ipcRenderer.on('resetcol', (event, arg) => {
  reset_cols()
})

$(document).ready(ready_func)