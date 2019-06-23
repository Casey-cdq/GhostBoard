const {shell} = require('electron'); 

function open_url(url){
	console.log("open "+url)
	shell.openExternal(url);
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
exports.post = request_post;
exports.get = request_get;
exports.base_url = "http://localhost:8080";