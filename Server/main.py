#coding=utf-8

import web
import tushare as ts
import thread
import time
import json
import requests

urls = (
    '/', 'index',
    '/sug', 'sug'
)

all_data = {}
all_data["a"] = {}

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

class sug:
    def GET(self):
        user_data = web.input()
        key = user_data.key
        if key.strip().startswith("@"):
            return {"message":"no input"}
        id,m = id_market_from_key(key)
        if m == "a":
            print "get sug : " + id
            sina_key = id
            now = int(1000*time.time())
            url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
            ret = requests.get(url)
            print(ret.text)
            sina_sug = parse_sina_sug(ret.text)
            ret_sug = {}
            ret_sug['value'] = sina_sug
            return json.dumps(ret_sug)
        else:
            return {"err":"not support.."}

#sh=上证指数 sz=深圳成指 hs300=沪深300指数 sz50=上证50 zxb=中小板 cyb=创业板
class index:
    def POST(self):
        pool = web.req_pool
        data = web.data()
        aslist = json.loads(data.decode())
        ret = []
        now = time.time()
        for one in aslist:
            pool[one] = now
            ret.append(get_one_from_map(one))
        # print "ret:"+str(ret)
        return json.dumps(ret)

def DataLoop(name):
    while True:
        now = time.time()
        pool = web.req_pool
        a = []
        for one in pool:
            id,m = id_market_from_key(one)
            if m == "a" and now - pool[one] < 60:
                a.append(id)
        if len(a)>0:
            # print str(now)+" getting @a " + str(a)
            df = ts.get_realtime_quotes(a)
            jss = json.loads(df.to_json(orient='records'))
            for i in range(len(jss)):
                js = jss[i]
                js["key"] = a[i]+"@a"
                all_data["a"][js["key"]] = js
        time.sleep(5)

if __name__ == "__main__":
    web.req_pool = {}
    web.all_data = all_data
    thread.start_new_thread(DataLoop, ("Thread-1",))
    app = web.application(urls, globals())
    app.run()