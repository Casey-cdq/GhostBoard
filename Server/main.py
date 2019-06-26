#coding=utf-8

import numpy
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
all_data["hk"] = {}
all_data["chart@a"] = {}

def id_market_from_key(key):
    pair = key.split("@")
    id = pair[0]
    m = pair[1]
    return id,m

def get_one_from_map(one):
    id,m = id_market_from_key(one)
    market = web.all_data[m]
    ret = {}
    ret['key'] = one
    if one in market:
        it = market[one]
        ret['name'] = it['name']
        ret['code'] = it['code']
        ret['price'] = "%.2f" % (float(it['price']))
        ret['pre_close'] = "%.2f" % (float(it['pre_close']))
        ret['open'] = "%.2f" % (float(it['open']))

        vol = float(it['volume'])/10000
        if vol<10000:
            vol = "%.1f万股" % (vol)
        else:
            vol = "%.1f亿股" % (vol/10000)
        ret['volume'] = vol

        amt = float(it['amount'])/10000
        if amt<10000:
            amt = "%.1f万" % (amt)
        else:
            amt = "%.1f亿" % (amt/10000)
        ret['amount'] = amt

        prc = float(ret['price'])
        pcl = float(ret['pre_close'])
        ret['per'] = "%.2f%%" % ((prc-pcl)/pcl*100)
        return ret
    else:
        ret['name'] = id
        return ret

def parse_sina_sug(m,text):
    sugs = []
    text = text.split('="')[1]
    text = text.split('";')[0].strip()
    if text == "":
        return sugs
    lines = text.split(";")
    for line in lines:
        tokens = line.split(',')
        mkt = tokens[1]
        code = tokens[2].strip()#600335
        mcode = tokens[3]#sh600335
        name = tokens[4].strip()
        if m=="a" and mkt=="11":
            sug = {}
            sug['code'] = code
            sug['name'] = name
            if mcode in ["sh000001","sz399001"]:
                sug['key'] = mcode[:2]+"@a"
            elif mcode == "sz399006":
                sug['key'] = "cyb@a"
            else:
                sug['key'] = code+"@a"
            sugs.append(sug)
        elif m=="hk" and mkt=="31":
            sug = {}
            sug['code'] = code
            sug['name'] = name
            sug['key'] = code+"@hk"
            sugs.append(sug)
        else:
            print("code not right..."+line)
    return sugs

class chart:
    def GET(self):
        user_data = web.input()
        key = user_data.key
        id, m = id_market_from_key(key)
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
    def GET(self):
        user_data = web.input()
        key = user_data.key
        if key.endswith("?"):
            key = key[:-1]
        if key.strip().startswith("@"):
            return {"message":"no input"}
        id,m = id_market_from_key(key)
        if m == "a" or m=="hk":
            print("get sug : " + id)
            sina_key = id
            now = int(1000*time.time())
            url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
            ret = requests.get(url)
            sina_sug = parse_sina_sug(m,ret.text)
            ret_sug = {}
            ret_sug['value'] = sina_sug
            return json.dumps(ret_sug)
        else:
            return json.dumps({"err":"not support.."+key})

#sh=上证指数 sz=深圳成指 hs300=沪深300指数 sz50=上证50 zxb=中小板 cyb=创业板
class index:
    def POST(self):
        pool = web.req_pool
        data = web.data()
        psd = json.loads(data.decode())
        print("post:"+str(psd))
        aslist = psd['keys']
        ret = {}
        datas=[]
        now = time.time()
        lt = arrow.now().date()
        for one in aslist:
            pool[one] = now
            obj = get_one_from_map(one)
            if 'time' in obj:
                the_time = "%d-%02d-%02d %s" % (lt.year, lt.month, lt.day, obj["time"])
                the_time = arrow.get(the_time).timestamp
                obj['ts'] = the_time
            datas.append(obj)
        ret['datas'] = datas
        # ret['warning'] = "免费版目前只支持一只股票"
        # ret['warning'] = 'new version <a onclick="cm.open_url(\'http://www.baidu.com\');" href="#">DD</a>'
        return json.dumps(ret)

def loopA(now,a):
    print(str(now)+" getting @a " + str(a))
    df = None
    try:
        df = ts.get_realtime_quotes(a)
    except Exception as e:
        print("get_realtime_quotes Exception:")
        print(e)
        return
    else:
        pass
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

def parse_hk(text):
    lines = text.split("\n")
    for l in lines:
        if len(l.strip())==0:
            continue
        left = l.split('hq_str_rt_hk')[1].split("=")
        code = left[0]
        left = left[1].split(",")
        vol = left[12]
        amt = left[11]
        prc = left[6]
        op = left[2]
        pc = left[3]
        name = left[1]
        key = code+"@hk"
        stock = {}
        stock['code'] = code
        stock['volume'] = vol
        stock['amount'] = amt
        stock['price'] = prc
        stock['open'] = op
        stock['pre_close'] = pc
        stock['name'] = name
        stock['key'] = key
        all_data["hk"][key] = stock

def loopHK(now,hk):
    print(str(now)+" getting @hk " + str(hk))
    url = "http://hq.sinajs.cn/list="
    for i in hk:
        url += "rt_hk"+i+","
    ret = requests.get(url)
    parse_hk(ret.text)

def DataLoop(name):
    while True:
        now = time.time()
        pool = web.req_pool
        a = list()
        hk = list()
        for one in pool:
            id,m = id_market_from_key(one)
            if m == "a" and now - pool[one] < 60:
                a.append(id)
            elif m == "hk" and now - pool[one] < 60:
                hk.append(id)
        a.extend(web.a_fixed)
        if len(a)>0:
            loopA(now,a)
        if len(hk)>0:
            loopHK(now,hk)
        time.sleep(10)

if __name__ == "__main__":
    web.req_pool = {}
    web.all_data = all_data
    web.a_fixed = ["sh","sz","cyb"]
    thread.start_new_thread(DataLoop, ("Thread-1",))
    app = web.application(urls, globals())
    app.run()
