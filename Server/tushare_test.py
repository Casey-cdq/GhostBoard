import tushare as ts
import time,requests

sina_key = "399006"
now = int(1000*time.time())
url = "https://suggest3.sinajs.cn/suggest/type=&key=%s&name=suggestdata_%d" % (sina_key,now)
ret = requests.get(url)
print(ret.text)

dt = time.time()
# all = ts.get_today_all()
# all = ts.get_realtime_quotes(['sh','600355'])
# all = ts.get_stock_basics()

# pro = ts.pro_api()
# all = pro.stock_basic(exchange='', list_status='L', fields='ts_code,symbol,name')
# print all
# print all.to_json(orient='records')
# print all.iloc[0]

print (time.time()-dt)