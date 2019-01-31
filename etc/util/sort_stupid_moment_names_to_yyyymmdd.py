import glob
import os
import datetime

base = "/Volumes/fatty/photo_wash_munging/img/photo_export_tests"



def getn(path):
	return path.split(os.sep)[-1]


files = glob.glob("%s/*" % base)
#print(files)


def snarf_with_specifier(name):
	pass

def snarf(name):
	res = {}
	if "-" in name:
		#ch = name.split("-")
		ch = name.split(",")
		dtch = ",".join(ch[-2:]).strip()
		loc = ch[:-2]
		res['loc' ] = ",".join(loc)
		#print(loc)
		dt = datetime.datetime.strptime(dtch, "%B %d, %Y")
		res['date'] = dt
		#print(dtch)
		#print(ch)
	else:
		dt = datetime.datetime.strptime(name, "%B %d, %Y")
		res['date'] = dt
		#	print(dt)

		#print(dt)

	return res


for f in files:
	n = getn(f)
	print(n)
	info = snarf(n)
	print(info['date'])
	#print(n)
