
import glob
import os
import shutil


unmatch = []

def getn(path):
	return path.split(os.sep)[-1]

class DuplicateFinder(object):
	def __init__(self):
		self.data = {}

	def analyze(self):
		bysize = {}
		files = self.data['matched']
		files.sort()
		for f in files:
			n = f.split(os.sep)[-1]
			#print(n)
			st = os.stat(f)
			sz = st.st_size
			if sz in bysize:
				arr = bysize[sz]
			else:
				arr = []
			arr.append(f)
			bysize[sz] = arr
			#print(st.st_size)
		dupes = {}
		for k in bysize:
			v = bysize[k]
			if len(v) > 1:
				dupes[k] = v

		keys = dupes.keys()
		print("Analysis complete: preliminarily spotted %d duplicates." % len(keys))
		keys.sort()
		for i,k in enumerate(keys):

			arr = dupes[k]
			# print(arr)
			odir = os.sep.join([self.data['path'], '..' ,"dupes","group_%d" % i])
			if not os.path.exists(odir):
				os.makedirs(odir)
			for i2,f in enumerate(arr):
				n = getn(f)
				iff = f
				off = odir + os.sep + n
				print(iff + " -> " + off)
				if i2 > 0:
					shutil.move(iff, off)

		#print(dupes.keys())

	def search(self,path):
		# basepath =
		self.data['path'] = path
		extensions = "png jpg".split()

		#files = []

		files = glob.glob("%s/*" % path)

		matched = []
		for f in files:
			n = f.split(os.sep)[-1]
			t, e = os.path.splitext(n)
			#print(e)

			test = e.lower()[1:]
			# print(test)
			if test in extensions:
				matched.append(f)
			else:
				unmatch.append(f)
		#print(len(matched))
		#print(len(unmatch))
		self.data['matched'] = matched
		self.data['unmatch'] = unmatch
		print("Search complete, matched %d and %d unmatched." % (len(matched), len(unmatch)))

if __name__ == "__main__":
	d = DuplicateFinder()
	d.search("/Volumes/fatty/photo_wash_munging/img/photo_export_test_originals")
	d.analyze()
