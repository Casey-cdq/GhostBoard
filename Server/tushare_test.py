import tushare as ts
from tushare.util import dateu as du
import time,requests

ts.set_token("615edeacc3889128148a6722ba2fda81aa6c66d671e2b9d4efd1bc84")

# sina_key = "399006"
# now = int(1000*time.time())
# url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
# ret = requests.get(url)
# print(ret.text)

dt = time.time()
# while True:
#     dt = time.time()
#     all = ts.get_today_all()
#     print (time.time() - dt)
#     time.sleep(25)

# all = ts.get_realtime_quotes(['600355'])
# all = ts.get_stock_basics()

# all = ts.trade_cal()

# pro = ts.pro_api()
# all = pro.stock_basic(exchange='', list_status='L', fields='ts_code,symbol,name')
# print all
# print all.to_json(orient='records')
# print all.iloc[0]



# df = ts.get_today_ticks('600355')
# print df

print time.localtime()
lt = time.localtime()
print lt.tm_mday

print du.is_holiday(du.today())

print (time.time()-dt)