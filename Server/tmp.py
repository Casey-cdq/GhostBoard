import arrow
import tushare as ts
import time
import pandas as pd
import requests
def get_stock_basics():
    fn = "sb_"+str(arrow.now().date())+".csv"
    import os
    df = None
    if os.path.exists(fn):
        df = pd.read_csv(fn)
        print("from file..")
    else:
        df = ts.get_stock_basics()
        df.to_csv(fn)
        print("from net..")
    return df
    print df

# df = ts.get_today_ticks("600355")
# df = df[["time","price"]]
# the_time = "%d-%02d-%02d " % (lt.year, lt.month, lt.day)
# df["time"] = (the_time+df["time"]).apply(lambda x:arrow.get(x).timestamp)
# print df
def parse_sina_sug(text):
    sugs = []
    text = text.split('="')[1]
    text = text.split('";')[0].strip()
    if text == "":
        return sugs
    lines = text.split(";")
    for line in lines:
        print(line)

# now = int(1000*time.time())
# sina_key = "y"
# url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
# ret = requests.get(url)
# parse_sina_sug(ret.text)

# print(ts.get_realtime_quotes("505888"))

def parse_hk(text):
    print(text)
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
        stock = {}
        stock['code'] = code
        stock['volume'] = vol
        stock['amount'] = amt
        stock['price'] = prc
        stock['open'] = op
        stock['pre_close'] = pc
        stock['name'] = name
        print(stock)

url = "http://hq.sinajs.cn/list=rt_hk08293,rt_hk00700"
ret = requests.get(url)
parse_hk(ret.text)