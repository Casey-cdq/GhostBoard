var cm = require("../common")
const log = require('electron-log')
const storage = require('electron-json-storage')
const defaultDataPath = storage.getDefaultDataPath()
log.info(defaultDataPath)
var remote = require('electron').remote
var online = require('./online')

Mousetrap.bind('ctrl+c', () => {
    config()
})

Mousetrap.bind('ctrl+t', () => {
	add_new()
})

Mousetrap.bind('ctrl+z', () => {
	change_model()
})

function change_model(){
	cm.get_current_config(function(conf){
		if(conf.model==="nm"){
			conf.model="sm"
		}else{
			conf.model="nm"
		}
		cm.save_config(conf,function(){
			reload_fromconfig()
		})
	})
}

var the_current_req = undefined

function gb_chart(ev){
	key = ev.data
	const { BrowserWindow } = require('electron').remote
	conf = {}
	conf.fullscreenable = false
	conf.fullscreen = false
	conf.width = 400
	conf.height = 200
	conf.show = false
	conf.alwaysOnTop = true
	conf.title = "幽灵股票"
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
	let app = require('electron').remote.app
	if(!app.isPackaged){
	win.webContents.openDevTools({ mode: 'detach' })
	}
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

		    	log.info("delete keys ok ")
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

function gb_alias_save(key){
	let alias = $('#alias')
	let an = alias.children().first().val()
	console.log("give key:"+key+" alias:"+an)
	cm.get_current_config(function(conf) {
		conf.alias[key] = an
		cm.save_config(conf, function() {
			alias.remove()
	    	request_keys_and_set_timer(false)
		});
	});
}

function row_op_click(key){

}

function gb_alias(ev){
	key = ev.data
	let alias_div = $('<div id="alias" class="position-absolute" style="left:1px;top:1px;"></div>')
	let alias_ip = $('<input style="width:120px;" class="d-block" type="text"></input>')
	let name = $("#gbrow").children("tr[id='"+key+"']").children("td#name").text()
	alias_ip.attr("placeholder",name)
	alias_div.append(alias_ip)
	alias_div.append($('<a style="width:60px;" onclick="gb_alias_save(\''+key+'\')" href="#" class="d-inline-block text-center text-white bg-info">保存</a>'))
	alias_div.append($('<a style="width:60px;" onclick="$(\'#alias\').remove();" href="#" class="d-inline-block text-center text-white bg-danger">关闭</a>'))
	$("#gbrow").append(alias_div)
	alias_ip.focus()
}

function gb_add_row(key,row){
	console.log("add key :"+key)
	let row_all = $('<tr></tr>')
	for ( k in row){
		td = $('<td class="px-1 py-1">-</td>')
		td.attr("id",k)
		if(k=="per"){
			td.addClass("text-center")
		}
		row_all.append(td)
	}

	let colhead = $("#colhead")

	let bts = $('<div></div>')
	// bts.addClass("btn-group")
	bts.addClass("collapse")
	bts.css("left",0)
	bts.css("height",colhead.height())
	bts.css("-webkit-transition","none")
	bts.css("background")
	bts.addClass("position-absolute")

	let bttext = '<a href="#" class="text-white"></a>'

	// let top_bt = $(bttext).text('置顶')
	// top_bt.addClass('bg-info')
	// top_bt.click(key,gb_top_row)
	// bts.append(top_bt)

	let alias_bt = $(bttext).text('别名')
	alias_bt.addClass('bg-warning')
	alias_bt.click(key,gb_alias)
	bts.append(alias_bt)

	let chart_bt = $(bttext).text('分时')
	chart_bt.addClass('bg-primary')
	chart_bt.click(key,gb_chart)
	bts.append(chart_bt)

	let del_bt = $(bttext).text('删除')
	del_bt.addClass("bg-danger")
	del_bt.click(key,gb_delete_row)
	bts.append(del_bt)

	// let op_bt = $(bttext).html('<span class="fa fa-cog"></span>')
	// op_bt.addClass('bg-info')
	// op_bt.click(key,row_op_click)
	// bts.append(op_bt)

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
	conf.title = "幽灵股票"
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
	let app = require('electron').remote.app
	if(!app.isPackaged){
		win.webContents.openDevTools({ mode: 'detach' })
	}
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

function help(){
	$("#help").addClass("disabled")

	const { BrowserWindow } = require('electron').remote
	conf = {}
	conf.fullscreenable = false
	conf.fullscreen = false
	conf.show = false
	conf.alwaysOnTop = false
	conf.title = "幽灵股票"
	conf.frame = true
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
	win.loadFile('render/help.html')

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
		$("#help").removeClass("disabled")
	})
}

function config(){
	console.log("config click")

	$("#config").addClass("disabled")

	const { BrowserWindow } = require('electron').remote
	conf = {}
	conf.fullscreenable = false
	conf.fullscreen = false
	conf.width = 500
	conf.height = 100
	conf.x = window.screen.width/2 - conf.width/2
	conf.y = window.screen.height/2 - conf.height/2
	conf.show = false
	conf.alwaysOnTop = false
	conf.title = "幽灵股票"
	conf.frame = false
	conf.opacity = 1.0
	conf.resizable = false
	// conf.useContentSize = true
	conf.minimizable = false
	conf.maximizable = false
	conf.webPreferences = {nodeIntegration:true}
	// conf.transparent = true

	// 创建浏览器窗口。
	win = new BrowserWindow(conf)

	// 然后加载应用的 index.html。
	win.loadFile('render/config.html')

	// 打开开发者工具
	let app = require('electron').remote.app
	if(!app.isPackaged){
		win.webContents.openDevTools({ mode: 'detach' })
	}

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
	$("#info").addClass("disabled")

	const { BrowserWindow } = require('electron').remote
	conf = {}
	conf.fullscreenable = false
	conf.fullscreen = false
	conf.show = false
	conf.alwaysOnTop = false
	conf.title = "幽灵股票"
	conf.frame = true
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
	win.loadFile('render/info.html')

	// 打开开发者工具
	// let app = require('electron').remote.app
	// if(!app.isPackaged){
	// 	win.webContents.openDevTools({ mode: 'detach' })
	// }

	win.once('ready-to-show', () => {
		win.show()
	})

	// 当 window 被关闭，这个事件会被触发。
	win.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		win = null
		$("#info").removeClass("disabled")
	})
}

function vcol_from_col(v,col,alias){
	let ret = {}
	ret.name = v.name
	ret.per = v.per

	if(alias[v.key]===undefined){
	}else{
		ret.name = alias[v.key]
	}

	for (c in col){
		let key = col[c].split("|")[0]
		ret[key] = v[key]
	}

	return ret
}

function reload(){
	remote.getCurrentWindow().reload()
}

function sort_col(ele){
	cm.get_current_config(function(conf){
		let select = $(ele).parent().attr("id")
		let sk = conf.sort
		if(sk===""){
			sk = select+"#asc"
		}else{
			let order = sk.split("#")[1]
			let ok = sk.split("#")[0]
			if(select===ok){
				if (order==="asc"){
					sk = select + "#desc"
				}else if(order==="desc"){
					sk = ""
				}else{
					sk = select+"#asc"
				}
			}else{
				sk = select+"#asc"
			}
		}

		conf.sort = sk

		cm.save_config(conf, function() {
			request_keys_and_set_timer(true)
		});
	})
	console.log()
}

function set_order_sign(sort){
	if(sort==undefined){
		return
	}
	let all_fa = $("#colhead").find(".fa")
	all_fa.addClass("d-none")
	all_fa.removeClass("d-inline")
	if(sort===""){
	}else{
		let tks = sort.split("#")
		let k = tks[0]
		let od = tks[1]
		let hd = $("#colhead").children("#"+k)
		if(od=="desc"){
			hd.children(".fa-sort-asc").addClass("d-inline")
			hd.children(".fa-sort-asc").removeClass("d-none")
		}else{
			hd.children(".fa-sort-desc").addClass("d-inline")
			hd.children(".fa-sort-desc").removeClass("d-none")
		}
	}
}

function request_keys_and_set_timer(emp){
	console.log("call ===== request_keys_and_set_timer")
	$("#drag").addClass("d-none")
	$("#refresh").removeClass("d-none")
	cm.get_current_config(function(data) {

		let req_data = {}
		req_data.uuid = data.uuid
		req_data.v = remote.app.getVersion()
		req_data.sort = data.sort

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
			the_current_req.aa()
			console.log("-----------abort last request----------")
		}

		req_data.keys = keys

		the_current_req = online.get_keys(req_data,
			 function (retdata) {
		        console.log("OK:"+JSON.stringify(retdata))
		        gbrow = $("#gbrow")
		        if (emp){
		        	gbrow.empty()
		        }
		        if (typeof(retdata.warning)!="undefined"){
		        	$("#warnalert").html(retdata.warning)
		        	$("#warnalert").removeClass("d-none")
		        }else{
		        	$("#warnalert").addClass("d-none")
		        }

		        let message = retdata.datas

		        let added = false

		        set_order_sign(retdata.sort)

		        for (i in message){
		        	v = message[i]
		        	v_col = vcol_from_col(v,data.col,data.alias)
		        	row_td = gbrow.children("tr[id='"+v.key+"']")
		        	if (row_td.length==0){
		        		gb_add_row(v.key,v_col)
		        		added = true
		        	}

		        	row_td = gbrow.children("tr[id='"+v.key+"']")
		        	gb_set_row(v.key,row_td,v_col)
		        }

		        ret_window_height()

		        $("#drag").removeClass("d-none")
				$("#refresh").addClass("d-none")

		        the_current_req = undefined
		    },
		    function (message) {
		        console.log("NOTOK:"+JSON.stringify(message))
		        the_current_req = undefined
		    }
		)

	});

}

function reset_font(data){
	$("#board").css("font-size",Number(data.fontsize))
}

function reset_cols(data){

	let col_keys = ["name|股票名","per|涨跌幅"]
	col_keys = col_keys.concat(data.col)
	let alin = []
	$("#colhead").children().each(function(){
		let ck = $(this).attr("id")+"|"+$(this).text()
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
			let t = '<th id="'+key+'" class="px-1 py-1" scope="col"><a class="text-secondary" href="#" onclick="sort_col(this);">'+name+'</a><span class="d-none fa fa-sort-asc"></span><span class="d-none fa fa-sort-desc"></span></th>'
			$("#colhead").append($(t))
		}
	}	
}

function reset_model(data){
	if(data.model==="nm"){
		$("#btns").removeClass("d-none")
		$("#colhead").removeClass("d-none")

		$("#gbrow").css("-webkit-app-region","none")
	}else{
		$("#btns").addClass("d-none")
		$("#colhead").addClass("d-none")

		$("#gbrow").css("-webkit-app-region","drag")
	}
}

function reload_fromconfig(func){
	cm.get_current_config(function(data){
		reset_font(data)
		reset_cols(data)
		reset_model(data)

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

		request_keys_and_set_timer(true)
	})
}

function ready_func(){
	// reset_font()
	cm.setup_opacity_control("opa",remote.getCurrentWindow())
	reload_fromconfig()

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

ipcRenderer.on('reload_fromconf', (event, arg) => {

  reload_fromconfig()
})

$(document).ready(ready_func)