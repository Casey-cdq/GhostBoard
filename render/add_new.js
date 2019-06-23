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

		    	console.log("set keys ok ")
			});
		});
	}).on('onUnsetSelectValue', function () {
		console.log("onUnsetSelectValue");
	});
}

function addnew_ready(){
	console.log("addnew_ready")
	setup_sug()
	get_current_config(function(data){
		// $("#fontsize").attr("value",data.fontsize)
	})
}

$(document).ready(addnew_ready)