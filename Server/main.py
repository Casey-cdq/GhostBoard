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

    if it['price']<1:
        ret['price'] = "%.4f" % (it['price'])
    else:
        ret['price'] = "%.2f" % (it['price'])

    if it['pre_close']<1:
        ret['pre_close'] = "%.4f" % (it['pre_close'])
    else:
        ret['pre_close'] = "%.2f" % (it['pre_close'])

    if it['open']<1:
        ret['open'] = "%.4f" % (it['open'])
    else:
        ret['open'] = "%.2f" % (it['open'])

    if 'volume' in it:
        vol = float(it['volume'])/10000
        if vol<10000:
            vol = "%.1f万" % (vol)
        else:
            vol = "%.1f亿" % (vol/10000)
        ret['volume'] = vol

    if "amount" in it:
        amt = float(it['amount'])/10000
        if amt<10000:
            amt = "%.1f万" % (amt)
        else:
            amt = "%.1f亿" % (amt/10000)
        ret['amount'] = amt

    prc = float(ret['price'])
    pcl = float(it['pre_close'])
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
    stock['price'] = float(prc)
    stock['open'] = float(op)
    stock['pre_close'] = float(pc)
    stock['name'] = name
    stock['key'] = key
    stock['mkt'] = "hk"
    return get_one_from(key,stock)

def parse_sina_a(l):
    left = l.split('hq_str_')[1].split("=\"")
    if left[0]=="?":
        return None
    code = left[0]
    left = left[1].split(",")
    vol = left[8]
    amt = left[9]
    prc = left[3]
    op = left[1]
    pc = left[2]
    name = left[0]
    key = code+"@a"
    stock = {}
    stock['code'] = code
    stock['volume'] = vol
    stock['amount'] = amt
    stock['price'] = float(prc)
    stock['open'] = float(op)
    stock['pre_close'] = float(pc)
    stock['name'] = name
    stock['key'] = key
    stock['mkt'] = "a"
    return get_one_from(key,stock)

#var hq_str_fx_susdcny="23:29:00,6.8671,6.8668,6.8771,257,6.8749,6.8817,6.856,6.8668,在岸人民币,-0.18,-0.0121,0.003738,Cougar Capital Management. New York,6.9762,6.5979,*+-++--+,2019-06-28";
def parse_fx(l):
    left = l.split("hq_str_fx_s")[1].strip().split("=\"")
    code = left[0]
    left = left[1].split(",")
    name = left[9]
    op = left[5]
    pc = left[3]
    prc = left[2]
    high = left[6]
    low = left[7]
    key = code+"@fc"
    stock = {}
    stock['code'] = code
    stock['price'] = float(prc)
    stock['open'] = float(op)
    stock['pre_close'] = float(pc)
    stock['name'] = name
    stock['key'] = key
    stock['mkt'] = "fx"
    return get_one_from(key,stock)

#var hq_str_btc_btcbtcusd="01:10:34,0.0000,0.0000,11906.7000,0,11906.7000,12174.3000,10970.5000,11897.3000,比特币美元(BTC/USD),1260000.0000,2019-06-29";
def parse_cc(l):
    left = l.split("hq_str_btc_")[1].strip().split("=\"")
    code = left[0]
    left = left[1].split(",")
    # print(left)
    name = left[9]
    op = left[5]
    pc = left[3]
    prc = left[8]
    high = left[6]
    low = left[7]
    vol = left[10]
    # amt = left[9]
    key = code+"@fc"
    stock = {}
    stock['volume'] = vol
    # stock['amount'] = amt
    stock['code'] = code
    stock['price'] = float(prc)
    stock['open'] = float(op)
    stock['pre_close'] = float(pc)
    stock['name'] = name
    stock['key'] = key
    stock['mkt'] = "cc"
    return get_one_from(key,stock)

def parse_sina_text(datas,text):
    lines = text.split("\n")
    # logging.info(lines)
    for l in lines:
        if len(l.strip())==0:
            continue
        d = None
        if "hq_str_rt_hk" in l:
            d = parse_hk(l)
        elif "hq_str_fx_s" in l:
            d = parse_fx(l)
        elif "hq_str_btc" in l:
            d = parse_cc(l)
        else:
            d = parse_sina_a(l)
        if d is not None:
            datas.append(d)

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
        # ret['warning'] = "免费版目前只支持一只股票"
        # ret['warning'] = 'new version <a onclick="cm.open_url(\'http://www.baidu.com\');" href="#">DD</a>'
        # print(ret)
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
