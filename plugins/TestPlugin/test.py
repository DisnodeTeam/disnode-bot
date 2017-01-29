import bpy
import sys
argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"

print(argv)  # --> ['example', 'args', '123']
bpy.data.objects["Text"].data.body = argv[0];