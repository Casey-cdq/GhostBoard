#coding=utf-8

import web
import tushare as ts
import thread
import time
import json
import requests
import arrow

urls = (
    '/', 'index',
    '/sug', 'sug',
    '/chart', 'chart'
)

all_data = {}
all_data["a"] = {}
all_data["chart@a"] = {}

def id_market_from_key(key):
    pair = key.split("@")
    id = pair[0]
    m = pair[1]
    return id,m

def get_one_from_map(one):
    id,m = id_market_from_key(one)
    market = web.all_data[m]
    if one in market:
        return market[one]
    else:
        return {"key":one}

def parse_sina_sug(text):
    sugs = []
    text = text.split('="')[1]
    text = text.split('";')[0].strip()
    if text == "":
        return sugs
    lines = text.split(";")
    for line in lines:
        tokens = line.split(',')
        code = tokens[2].strip()
        if tokens[0] in ["sh000001","sz399001"]:
            sug = {}
            sug['code'] = code
            sug['name'] = tokens[4].strip()
            sug['key'] = tokens[0][:2]+"@a"
            sugs.append(sug)
        elif tokens[0] == "sz399006":
            sug = {}
            sug['code'] = code
            sug['name'] = tokens[4].strip()
            sug['key'] = "cyb@a"
            sugs.append(sug)
        elif len(code)==6:
            sug = {}
            sug['code'] = code
            sug['name'] = tokens[4].strip()
            sug['key'] = code+"@a"
            sugs.append(sug)
        else:
            print "code not right..."+line
    return sugs

class chart:
    def OPTIONS(self):
            web.header('Access-Control-Allow-Origin','*', unique=True)
            web.header('Access-Control-Allow-Headers','X-Requested-With, access-token, Content-Type', unique=True)
            #web.header('Access-Control-Allow-Credentials',true, unique=True)
            return json.dumps({})
    def GET(self):
        user_data = web.input()
        key = user_data.key
        id, m = id_market_from_key(key)
        web.header('Access-Control-Allow-Origin','*', unique=True)
        web.header('Access-Control-Allow-Headers','X-Requested-With, access-token, Content-Type', unique=True)
        if m == "a":
            ret = {}
            ret["key"] = key
            ret["quote"] = web.all_data["a"][key]
            # if id in web.a_fixed:
            ret["type"] = "index"
            ret["his"] = web.all_data["chart@a"][key]
            # else:
            #     df = ts.get_today_ticks(id)
            #     df = df[["time","price"]]
            #     lt = arrow.now().date()
            #     df = ts.get_today_ticks("600355")
            #     df = df[["time", "price"]]
            #     the_time = "%d-%02d-%02d " % (lt.year, lt.month, lt.day)
            #     df["time"] = (the_time + df["time"]).apply(lambda x: arrow.get(x).timestamp)
            #     his = df.to_json(orient='records')
            #     ret["his"] = his
            return json.dumps(ret)
        else:
            return json.dumps({'err':'not support market.'})

class sug:
    def OPTIONS(self):
        web.header('Access-Control-Allow-Origin','*', unique=True)
        web.header('Access-Control-Allow-Headers','X-Requested-With, access-token, Content-Type', unique=True)
        #web.header('Access-Control-Allow-Credentials',true, unique=True)
        return json.dumps({})
    def GET(self):
        user_data = web.input()
        key = user_data.key
        if key.strip().startswith("@"):
            return {"message":"no input"}
        id,m = id_market_from_key(key)
        web.header('Access-Control-Allow-Origin','*', unique=True)
        web.header('Access-Control-Allow-Headers','X-Requested-With, access-token, Content-Type', unique=True)
        if m == "a":
            print "get sug : " + id
            sina_key = id
            now = int(1000*time.time())
            url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
            ret = requests.get(url)
            sina_sug = parse_sina_sug(ret.text)
            ret_sug = {}
            ret_sug['value'] = sina_sug
            return json.dumps(ret_sug)
        else:
            return json.dumps({"err":"not support.."})

#sh=上证指数 sz=深圳成指 hs300=沪深300指数 sz50=上证50 zxb=中小板 cyb=创业板
class index:
    def OPTIONS(self):
        web.header('Access-Control-Allow-Origin','*', unique=True)
        web.header('Access-Control-Allow-Headers','X-Requested-With, access-token, Content-Type', unique=True)
        #web.header('Access-Control-Allow-Credentials',true, unique=True)
        return json.dumps({})
    def POST(self):
        pool = web.req_pool
        data = web.data()
        aslist = json.loads(data.decode())
        print aslist
        ret = []
        now = time.time()
        lt = arrow.now().date()
        for one in aslist:
            pool[one] = now
            obj = get_one_from_map(one)
            if 'time' in obj:
                the_time = "%d-%02d-%02d %s" % (lt.year, lt.month, lt.day, obj["time"])
                the_time = arrow.get(the_time).timestamp
                obj['ts'] = the_time
            ret.append(obj)
        # print "ret:"+str(ret)
        web.header('Access-Control-Allow-Origin','*', unique=True)
        web.header('Access-Control-Allow-Headers','X-Requested-With, access-token, Content-Type', unique=True)
        return json.dumps(ret)

def DataLoop(name):
    while True:
        now = time.time()
        pool = web.req_pool
        a = list()
        for one in pool:
            id,m = id_market_from_key(one)
            if m == "a" and now - pool[one] < 60:
                a.append(id)
        a.extend(web.a_fixed)
        if len(a)>0:
            # print str(now)+" getting @a " + str(a)
            df = ts.get_realtime_quotes(a)
            jss = json.loads(df.to_json(orient='records'))
            for i in range(len(jss)):
                js = jss[i]
                js["key"] = a[i]+"@a"
                key = js["key"]
                all_data["a"][key] = js
                id, m = id_market_from_key(key)
                # if id in web.a_fixed:
                chart = all_data["chart@a"]
                if key not in chart:
                    chart[key] = []
                lt = arrow.now().date()
                the_time = "%d-%02d-%02d %s" % (lt.year, lt.month, lt.day,js["time"])
                the_time = arrow.get(the_time).timestamp
                chart[key].append({"price":js["price"],"time":the_time})
        time.sleep(5)

if __name__ == "__main__":
    web.req_pool = {}
    web.all_data = all_data
    web.a_fixed = ["sh","sz","cyb"]
    thread.start_new_thread(DataLoop, ("Thread-1",))
    app = web.application(urls, globals())
    app.run()
