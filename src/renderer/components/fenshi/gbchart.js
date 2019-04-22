const { remote } = require('electron')
var cm = require("../common")

Mousetrap.bind('esc', () => { 
	console.log('esc')
	
	remote.getCurrentWindow().close()
})

var pchart = undefined

function update_chart(quote){
    pchart.data.datasets.forEach((dataset) => {
        console.log("____")
        console.log(quote)
        let tmp = {}
        tmp.x = new Date(quote.ts*1000)
        tmp.y = quote.price
        dataset.data.push(tmp);
    });
    pchart.update();
}

function set_quote(quote){
  let qt = $("#qt")
  qt.empty()

  qt.append($("<tr></tr>").append($("<td>"+quote.a5_p+"</td>")).append($("<td>"+quote.a5_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.a4_p+"</td>")).append($("<td>"+quote.a4_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.a3_p+"</td>")).append($("<td>"+quote.a3_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.a2_p+"</td>")).append($("<td>"+quote.a2_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.a1_p+"</td>")).append($("<td>"+quote.a1_v+"</td>")))


  qt.append($("<tr></tr>").append($("<td>"+quote.b1_p+"</td>")).append($("<td>"+quote.b1_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.b2_p+"</td>")).append($("<td>"+quote.b2_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.b3_p+"</td>")).append($("<td>"+quote.b3_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.b4_p+"</td>")).append($("<td>"+quote.b4_v+"</td>")))
  qt.append($("<tr></tr>").append($("<td>"+quote.b5_p+"</td>")).append($("<td>"+quote.b5_v+"</td>")))

  let tt = $("tt")
  let per = (quote.price-quote.pre_close)/quote.pre_close*100
  tt.text(per+"%")
}

function init_chart(msg){
    // console.log(msg)
    quote = msg.quote
    set_quote(quote)

    let data = []
    let his = msg.his
    for (i in his){
      data.push({x:new Date(his[i].time*1000),y:his[i].price})
    }

    var ctx = $("#pchart");
    pchart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets:[
            {
              data:data
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
                    time: {
                         unit: 'minute'
                    }
                }]
            }
        }
    });
}

function request_new(key){
    keys = [key]

    if (typeof(the_current_req)!="undefined"){
      the_current_req.abort()
    }

    the_current_req = cm.post(cm.base_url,keys,
       function (message) {
              // console.log("OK:"+JSON.stringify(message))
              quote = message[0]

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

    console.log("gbchart doc ready.")
    console.log(window.location.href)
    
    let chart_key = queryURLParameter(window.location.href).key.replace("%40","@")
    console.log(chart_key)

    cm.get(cm.base_url+"/chart",{key:chart_key},
             function (message) {
                console.log("OK:"+message)

                init_chart(message)

                //start request and timer...
                window.setInterval(request_new,5000,chart_key)
            },
            function (message) {
                console.log("NOTOK:"+JSON.stringify(message))

                const { dialog } = require('electron').remote
                dialog.showMessageBox({message:"请求失败，请重试",buttons:["OK"]})
            }
    )
}

$(document).ready(chart_ready_func)