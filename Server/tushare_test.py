import tushare as ts
import time

dt = time.time()
# all = ts.get_today_all()
all = ts.get_realtime_quotes(['600848','600355'])

print all.to_json(orient='records')
print (time.time()-dt)