var cm = require("./common")

function add_new(){
	console.log("add click")
}

function help(){
	cm.open_url("http://help")
}

function config(){
	console.log("config click")
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