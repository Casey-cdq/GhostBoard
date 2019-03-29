import tushare as ts
import time

dt = time.time()
# all = ts.get_today_all()
# all = ts.get_realtime_quotes(['600848','600355'])

all = ts.get_stock_basics()

# pro = ts.pro_api()
# all = pro.stock_basic(exchange='', list_status='L', fields='ts_code,symbol,name')

print all
# print all.to_json(orient='records')

print all.iloc[0]

print (time.time()-dt)