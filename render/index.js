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
		td = $("<td>"+row[k]+"</td>")
		td.attr("id",k)
		row_all.append(td)
	}

	let bts = $("<div></div>")
	bts.addClass("btn-group")
	bts.addClass("collapse")
	bts.css("-webkit-transition","none")
	bts.css("transition","none")
	// bts.css("display","none")
	// bts.addClass("float-right")
	bts.add

	let bttext = '<button type="button" class="btn btn-primary btn-block"></button>'

	let chart = $(bttext).text('分时').addClass("col-sm")
	chart.click(key,gb_chart)
	chart.attr("id","chart_"+key)
	chart.prop('disabled',true)
	bts.append(chart)

	let top_bt = $(bttext).text('置顶').addClass("col-sm")
	top_bt.click(key,gb_top_row)
	bts.append(top_bt)

	let del_bt = $(bttext).text('删除').addClass("col-sm")
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

	let cbt = row.find("button[id='chart_"+key+"']")
	cbt.prop('disabled',false)
}


function add_new(){
	console.log("add click")

	$("#newboard").collapse('toggle')
	// let gb_ipc = require('electron').remote.require('./gb_ipc')
	// gb_ipc.new_add_window()

    // let row_len = $("#gbrow").children("tr").length
	// gb_add_row("test"+row_len,["ab"+row_len,"cde","fghj"])
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

	get_current_config(function(data){
		$("#fontsize").attr("value",data.fontsize)

		$("#setconfig").collapse('toggle')
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
	  	watch_keys = watch_keys.concat(data)
	  }

		delay = 5000

		keys = watch_keys

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

	            for (i in message){
	            	v = message[i]
	            	row_td = gbrow.children("tr[id='"+v.key+"']")
	            	if (row_td.length==0){
	            		gb_add_row(v.key,{name:v.name,code:v.code,price:v.price})
	            	}else{
	            		gb_set_row(v.key,row_td,{name:v.name,code:v.code,price:v.price})
	            	}
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
			$("#setconfig").collapse('hide')
			return
		}else{
			console.log("config changed.update and save.")
		}
	})	
}

function setup_sug(){
	$("#testNoBtn").bsSuggest({
			emptyTip: '未检索到匹配的数据',
	    url: cm.base_url+"/sug?key=",
	    effectiveFields: ["code", "name"],
	    getDataMethod: "url",
	    allowNoKeyword: false,
	    ignorecase: true,
	    showHeader: false,
	    showBtn: false,     //不显示下拉按钮
	    delayUntilKeyup: true, //获取数据的方式为 firstByUrl 时，延迟到有输入/获取到焦点时才请求数据
	    idField: "key",
	    keyField: "name",
	    clearable: true,
	    fnPreprocessKeyword: function(keyword) { //请求数据前，对输入关键字作进一步处理方法。注意，应返回字符串
	        return keyword+"@a";
	    },
	}).on('onDataRequestSuccess', function (e, result) {
		console.log('onDataRequestSuccess: ', result);
		
	}).on('onSetSelectValue', function (e, keyword, sel_data) {
		console.log('onSetSelectValue: ', keyword, sel_data);
		const storage = require('electron-json-storage')
		storage.get('keys', function(error, data) {
				if (error) throw error

				if(JSON.stringify(data) == '{}'){
			    	data = []
			  	}

			  	for (i in data){
			  		if (data[i]==sel_data.key){
			  			console.log("same key..")
			  			remote.getCurrentWindow().close()
			  			return
			  		}
			  	}

			data.push(sel_data.key)

			storage.set('keys', data, function(error) {
		    	if (error) throw error;

		    	add_new_cleanup()

		    	console.log("set keys ok ")
			});
		});
	}).on('onUnsetSelectValue', function () {
		console.log("onUnsetSelectValue");
	});
}

function ready_func(){
	$("#addnew").click(add_new)
	$("#help").click(help)
	$("#config").click(config)
	$("#info").click(info)
	$("#configsave").click(config_save)

	setup_sug()

	console.log("doc ready.")

	//start request and timer...
	request_keys_and_set_timer(false)
	window.setInterval(request_keys_and_set_timer,5000,false)
}

$(document).ready(ready_func)