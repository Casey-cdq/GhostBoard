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
    lines = text.split(";")
    for line in lines:
        tokens = line.split(',')
        code = tokens[2].strip()
        if len(code)==6:
            sug = {}
            sug['code'] = code
            sug['name'] = tokens[4]
            sug['key'] = code+"@a"
            sugs.append(sug)
        else:
            print "code not right..."+line
    return sugs

class sug:
    def POST(self):
        data = web.data()
        params = json.loads(data.decode())
        key = params['key']
        id,m = id_market_from_key(key)
        if m == "a":
            sina_key = id
            now = int(1000*time.time())
            url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
            ret = requests.get(url)
            sina_sug = parse_sina_sug(ret.text)
            return json.dumps(sina_sug)
        else:
            return {"err":"not support.."}

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
        print "ret:"+str(ret)
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
            print str(now)+" getting @a " + str(a)
            df = ts.get_realtime_quotes(a)
            jss = json.loads(df.to_json(orient='records'))
            for js in jss:
                js["key"] = js['code']+"@a"
                all_data["a"][js["key"]] = js
        time.sleep(3)

if __name__ == "__main__":
    web.req_pool = {}
    web.all_data = all_data
    thread.start_new_thread(DataLoop, ("Thread-1",))
    app = web.application(urls, globals())
    app.run()