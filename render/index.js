var cm = require("../common")

function gb_add_row(key,row){
	let row_all = $('<tr></tr>')
	for ( i in row){
		row_all.append($("<td>"+row[i]+"</td>"))
	}

	let bts = $("<div></div>")
	bts.addClass("collapse")

	let bttext = '<button type="button" class="btn btn-primary btn-block"></button>'
	bts.append($(bttext).text('K线'))
	bts.append($(bttext).text('置顶'))
	bts.append($(bttext).text('删除'))
	row_all.append(bts)

	// row_all.addClass("row")
	row_all.attr("id",key)

	$("#gbrow").append(row_all)

	$("#"+key).mouseenter(function(){
    	console.log("in " + key)
    	$(this).children('.collapse').collapse('show')
 	});

 	$("#"+key).mouseleave(function(){
    	console.log("out " + key)
    	$(this).children('.collapse').collapse('hide')
 	});
}



function add_new(){
	console.log("add click")

	  const { BrowserWindow } = require('electron').remote
	  conf = {}
	  conf.fullscreenable = false
	  conf.fullscreen = false
	  conf.width = 1000
	  conf.height = 600
	  conf.show = false
	  conf.alwaysOnTop = true
	  conf.title = "幽灵看盘"
	  conf.frame = false
	  conf.opacity = 1.0
	  conf.resizable = false
	  conf.useContentSize = true
	  conf.minimizable = false
	  conf.maximizable = false
	  // conf.transparent = true

	  // 创建浏览器窗口。
	  win = new BrowserWindow(conf)

	  // 然后加载应用的 index.html。
	  win.loadFile('render/add.html')

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

	// let gb_ipc = require('electron').remote.require('./gb_ipc')
	// gb_ipc.new_add_window()

    // let row_len = $("#gbrow").children("tr").length
	// gb_add_row("test"+row_len,["ab"+row_len,"cde","fghj"])
}

function help(){
	cm.open_url("http://help")
}

function config(){
	console.log("config click")

	$.ajax({
        type: "POST",
        url: "http://localhost:8080",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(["600355@a","300081@a"]),
        dataType: "json",
        success: function (message) {
            console.log("OK:"+message)
        },
        error: function (message) {
            console.log("NOTOK:"+message)
        }
    });
}

function info(){
	cm.open_url("http://info")
}

function ready_func(){
	$("#addnew").click(add_new)
	$("#help").click(help)
	$("#config").click(config)
	$("#info").click(info)

	console.log("doc ready.")
}

$(document).ready(ready_func)