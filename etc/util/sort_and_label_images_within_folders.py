import glob
import datetime
import os
import shutil
base = '/Volumes/fatty/photo_wash_munging/img/sorted'

targets = glob.glob("%s/*" % base)



def getn(path):
	return path.split(os.sep)[-1]


def sort_by_mtime(files):
	return sorted(files, key=lambda f: os.stat(f).st_mtime)


def sort_folder(t):
	files = glob.glob("%s/*" % t)
	# print(len(files))
	files.sort()
	files = sort_by_mtime(files)

	base = t.split(os.sep)[-1]
	#print(base)
	for i,f in enumerate(files):
		n = getn(f)
		trunk, ext = os.path.splitext(n)
		nn = base + "-" + str(i).zfill(4) + ext.lower()
		off = t + os.sep + nn
		shutil.copy(f, off)
		shutil.copystat(f, off)
		# shutil.unlink(f)
		#print(f)

for t in targets:
	sort_folder(t)

