import sys

import glob
import os
import datetime
import shutil

from system1.slib.vos import recursive_glob_files

print("hello")



def getn(path):
	return path.split(os.sep)[-1]

wash_dir = os.path.expanduser("/Volumes/fatty/photo_wash_munging/wash")
image_dir = os.path.expanduser("/Volumes/fatty/photo_wash_munging/img/src")
out_dir = "/Volumes/fatty/photo_wash_munging/out"

if not os.path.exists(out_dir):
	os.makedirs(out_dir)

washes = recursive_glob_files(wash_dir, "*.wash")
images = []

exts = "png jpg".split()
for e in exts:
	images += recursive_glob_files(image_dir, "*.%s" % e )
	images += recursive_glob_files(image_dir, "*.%s" % e.upper() )


images = [x for x in images if getn(x)[0] != '.']
images.sort()
washes = [x for x in washes if getn(x)[0] != '.']
washes.sort()

print("%d washes." % len(washes))
print("%d images." % len(images))


cors = {}

def fuzzymatch(files, y, m, d):
	res = []
	#print("Matching %d %d %d ...".ljust(20) % ( y,m,d)),
	#print(len(files))
	files = [x for x in files if str(y) in x]
	for f in files:
		n = getn(f)
		ch = n.split("-")
		dch = [x for x in ch if str(y) in x][0]
		my, mm, md = dch.split('_')
		my, mm, md = [int(x) for x in my, mm, md]
		#print(my, mm, md, " : ", y, m, d)
		if my == y and mm == m == md == d:
			res.append(f)
	#print("%d." % len(res))
	return res


matches = {}

for f in images:
	st = os.stat(f)
	mt = st.st_mtime
	dt = datetime.datetime.fromtimestamp(mt)
	y = dt.year
	m = dt.month
	d = dt.day
	res = fuzzymatch(washes, y, m, d)
	if len(res) > 0:
		matches[f] = res

print("%d match candidates." % len(matches.keys()))

keys = matches.keys()

keys.sort()

for k in keys:
	n = getn(k)
	print("Finding nearest neighbor for: %s" % k)
	cands = matches[k]
	mt = os.path.getmtime(k)
	# print(mt)
	dt = datetime.datetime.fromtimestamp(mt)
	#print(cands)

	by_mod = {}
	for c in cands:
		cdt = datetime.datetime.fromtimestamp(os.path.getmtime(c))
		#print(cdt)
		delta = cdt - dt
		sec = delta.total_seconds()
		by_mod[sec] = c
	#print(by_mod)
	modkeys = by_mod.keys()
	modkeys.sort()
	# print(modkeys)

	ldelta = float("inf")
	lindex = -1
	for i,k2 in enumerate(modkeys):
		test = abs(k2)
		# print(test)
		if test < ldelta:
			ldelta = test
			lindex = i


	num = 1
	print(lindex, ldelta)
	print(modkeys)
	kslice = modkeys[lindex-num:lindex+num+1]
	print(kslice)

			#print(delta.total_seconds())
	opath = out_dir + os.sep + n.lower()
	if not os.path.exists(opath):
		os.makedirs(opath)

	iff = k
	off = opath + os.sep + n
	shutil.copy(iff, off)

	for k3 in kslice:
		wf = by_mod[k3]
		# print(wf)
		n2 = getn(wf)
		iff = wf
		off = opath + os.sep + n2
		shutil.copy(iff, off)
