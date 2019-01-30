import glob
import os
import shutil

from system1.slib.vos import recursive_glob_files


nest = "/Users/vs/art/barn/src/art/wash/org/lifedrawing/drinkndraw"
dst = "/Volumes/fatty/photo_wash_munging/wash"

def getn(path):
	return path.split(os.sep)[-1]

files = recursive_glob_files(nest, "*.wash")
for f in files:
	n = getn(f)
	if n[0] == '.':
		continue
	print(n)
	iff = f
	off = dst + os.sep + n
	shutil.copy(iff, off)
