#coding=utf-8

import numpy
import web
import tushare as ts
import thread
import time
import json
import requests
import arrow
import logging
logging.basicConfig(format='%(asctime)s - %(pathname)s[line:%(lineno)d] - %(levelname)s: %(message)s',level=logging.DEBUG)

urls = (
    '/', 'index',
    '/sug', 'sug',
    '/chart', 'chart'
)

def id_market_from_key(key):
    pair = key.split("@")
    id = pair[0]
    m = pair[1]
    return id,m

def get_one_from(one,it):
    ret = {}
    ret['key'] = one

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
            logging.warning("code not right..."+line)
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
            logging.info("get sug : " + id)
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

def parse_hk(l):
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
    return get_one_from(key,stock)

def parse_sina_a(l):
    left = l.split('hq_str_')[1].split("=\"")
    if left[0]=="?":
        return None
    code = left[0]
    left = left[1].split(",")
    logging.info("=====")
    logging.info(left)
    vol = left[8]
    amt = left[9]
    prc = left[3]
    op = left[1]
    pc = left[2]
    name = left[0]
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
    return get_one_from(key,stock)

def parse_sina_text(datas,text):
    lines = text.split("\n")
    # logging.info(lines)
    for l in lines:
        if len(l.strip())==0:
            continue
        if "hq_str_rt_hk" in l:
            datas.append(parse_hk(l))
        else:
            ret = parse_sina_a(l)
            if ret is not None:
                datas.append(ret)

#sh=上证指数 sz=深圳成指 hs300=沪深300指数 sz50=上证50 zxb=中小板 cyb=创业板
class index:
    def POST(self):
        data = web.data()
        psd = json.loads(data.decode("utf-8"))
        # logging.info("post:"+str(psd))
        text = psd['t']
        ret = {}
        datas=[]
        parse_sina_text(datas,text)
        ret['datas'] = datas
        ret['warning'] = "免费版目前只支持一只股票"
        # ret['warning'] = 'new version <a onclick="cm.open_url(\'http://www.baidu.com\');" href="#">DD</a>'
        print(ret)
        return json.dumps(ret)

def loopA(now,a):
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

def loopHK(now,hk):
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
    app = web.application(urls, globals())
    app.run()
