import arrow
import tushare as ts
import time

lt = arrow.now().date()
df = ts.get_today_ticks("600355")
df = df[["time","price"]]
the_time = "%d-%02d-%02d " % (lt.year, lt.month, lt.day)
df["time"] = (the_time+df["time"]).apply(lambda x:arrow.get(x).timestamp)
print df