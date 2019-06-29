const { remote } = require('electron')
var cm = require("../common")

Mousetrap.bind('esc', () => { 
	console.log('esc')
	
	remote.getCurrentWindow().close()
})

var pchart = undefined

function update_chart(quote){
    pchart.data.datasets.forEach((dataset) => {
        let tmp = {}
        tmp.x = new Date(quote.time*1000)
        tmp.y = quote.price
        dataset.data.push(tmp);
    });
    pchart.update();
}

function set_quote(quote){
  // let qt = $("#qt")
  // qt.empty()
  let per = quote.per
  let pn = 0.0
  if(typeof(per)!="undefined"){
    pn = Number(per.split("%")[0])
  }

  $("#per").text(per)
  let t = $("#per")
  if (pn>0.0){
    t.css('color','red')
  }else if(pn<0.0){
    t.css('color','green')
  }else{
    t.css('color','gray')
  }
}

function random(lower, upper) {
    return Math.floor(Math.random() * (upper - lower+1)) + lower;
}

function init_chart(msg){
    console.log(msg)
    quote = msg.quote
    set_quote(quote)

    let data = []
    let his = msg.his
    for (i in his){
      data.push({x:new Date(his[i].time*1000),y:his[i].price})
    }

    let cl = "rgb("+random(0,230)+","+random(0,230)+","+random(0,230)+")"

    var ctx = $("#pchart");
    pchart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets:[
            {
              label:quote.name,
              data:data,
              backgroundColor: cl,
              borderColor: cl,
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 1,
              borderWidth:1,
            }
          ]
        },
        options: {
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            },
            animation: {
                duration: 0 // general animation time
            },
            hover: {
                animationDuration: 0 // duration of animations when hovering an item
            },
            responsiveAnimationDuration:0,
            pointStyle:"line",
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'series',
                    // time: {
                    //      unit: 'minute'
                    // }
                }],
            },
        }
    });
}

function request_new(key){
    keys = {key:key}

    if (typeof(the_current_req)!="undefined"){
      the_current_req.abort()
    }

    the_current_req = cm.post(cm.base_url+"/update",keys,
       function (message) {
              // console.log("OK:"+JSON.stringify(message))
              quote = message

              update_chart(quote)
              set_quote(quote)

              the_current_req = undefined
          },
          function (message) {
              console.log("NOTOK:"+JSON.stringify(message))

              the_current_req = undefined
          }
    )
}

function queryURLParameter(url){
  let obj = {};
  if (url.indexOf('?')<0) return obj;
  let ary = url.split('?');
  urlParameter = ary[1];
  data = urlParameter.split('&');

  for (var i = 0; i < data.length; i++) {
    let curl = data[i],
      curAry = curl.split('=');
      obj[curAry[0]] = curAry[1];
  }
  return obj;
}

var the_current_req = undefined

function chart_ready_func(){

    cm.get_current_config(function(conf){
      remote.getCurrentWindow().setOpacity(conf.opa_chart)
    })

    cm.setup_opacity_control("opa_chart",remote.getCurrentWindow())

    console.log("gbchart doc ready.")
    console.log(window.location.href)
    
    let chart_key = queryURLParameter(window.location.href).key.replace("%40","@")
    console.log(chart_key)

    cm.post(cm.base_url+"/chart",{key:chart_key},
             function (message) {
                console.log("OK:"+message)

                init_chart(message)

                //start request and timer...
                window.setInterval(request_new,10000,chart_key)
            },
            function (message) {
                console.log("NOTOK:"+JSON.stringify(message))

                // const { dialog } = require('electron').remote
                // dialog.showMessageBox({message:"请求失败，请重试",buttons:["OK"]})
                $("#warnalert").removeClass("d-none")
            }
    )

    $("#close").click(function(){
      remote.getCurrentWindow().close()
    })
}

$(document).ready(chart_ready_func)