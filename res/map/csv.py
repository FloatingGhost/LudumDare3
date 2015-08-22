#!/usr/bin/env python3
import sys
f = open(sys.argv[1])
q = f.read().split("\n")
q = [x.split(",") for x in q]
print(q)
f.close()
f = open(sys.argv[1], "w+")
for i in q:
  for j in i:
    if j == '':
      f.write("\n")
    else:
      f.write(str(int(j)-1)+",")

f.close()
