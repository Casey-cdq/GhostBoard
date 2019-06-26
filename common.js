const {shell} = require('electron')
const storage = require('electron-json-storage')
const uuid = require('uuid/v1')

function open_url(url){
	console.log("open "+url)
	shell.openExternal(url);
}

function open_file(url){
    console.log("open "+url)
    shell.openItem(url);
}

function set_config(key,value){
    get_current_config(function(conf){
        conf[key] = value
        save_config(conf,function(){})
    })
}

function get_current_config(func){
    storage.get("config",function(error,data){
        if (error) throw error;

        if(JSON.stringify(data)=="{}"){
            //default config
            data.fontsize = "16"   
        }
        if(typeof(data.col)=="undefined"){
            data.col = []
        }
        if(typeof(data.keys)=="undefined"){
            data.keys = ["sh@a"]
        }
        if(typeof(data.opa)=="undefined"){
            data.opa = 1.0
        }
        if(typeof(data.uuid)=="undefined"){
            data.uuid = uuid()
        }
        console.log("config:")
        console.log(data)
        func(data)
    })
}

function save_config(data,func){
    storage.set('config', data, function(error) {
        if (error) throw error;

        func()
    });
}

function request_post(url,params,suc,fail){
    console.log("post to:"+url)
    console.log("params:",params)

	the_ajax = $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        dataType: "json",
        success: suc,
        error: fail
    });

	// the_ajax.abort()

	return the_ajax
}

function request_get(url,params,suc,fail){
    url += "?"
    for (k in params){
        url += k
        url += "="
        url += params[k]
        url += "&"
    }

    the_ajax = $.ajax({
        type: "GET",
        url: url,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        dataType: "json",
        success: suc,
        error: fail
    });

    return the_ajax
}

exports.open_url = open_url;
exports.open_file = open_file;
exports.post = request_post;
exports.get = request_get;
exports.get_current_config = get_current_config;
exports.save_config = save_config;
exports.set_config = set_config;
exports.base_url = "http://localhost:8080";