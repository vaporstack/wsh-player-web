import glob
import os
import datetime
import shutil




def getn(path):
	return path.split(os.sep)[-1]

path = "/Volumes/fatty/photo_wash_munging/img/src"
files = glob.glob("%s/*" % path)
files.sort()

exts = "jpg png".split()

for f in files:
	n = getn(f)
	trunk,ext = os.path.splitext(n)
	test = ext.lower()[1:]
	#print(test)
	if test not in exts:
		continue
	print(n)

	st = os.stat(f)
	mt = st.st_mtime
	dt = datetime.datetime.fromtimestamp(mt)
	#print(dt)


	odir = path + os.sep.join(["", "..", "sorted"])
	if not os.path.exists(odir):
		os.makedirs(odir)

	fol = datetime.datetime.strftime(dt, "drinkndraw-%Y_%m_%d")
	rodir= odir + os.sep + fol
	#print(rodir)
	if not os.path.exists(rodir):
		os.makedirs(rodir)
	iff = f
	off = rodir + os.sep + n

	shutil.copy(iff, off)
	shutil.copystat(iff, off)
