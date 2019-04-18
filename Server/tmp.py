import arrow
import tushare as ts
import time
import pandas as pd
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

df = get_stock_basics()
print df['industry'].unique()
# df = ts.get_today_ticks("600355")
# df = df[["time","price"]]
# the_time = "%d-%02d-%02d " % (lt.year, lt.month, lt.day)
# df["time"] = (the_time+df["time"]).apply(lambda x:arrow.get(x).timestamp)
# print df