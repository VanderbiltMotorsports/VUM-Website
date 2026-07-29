"""
Regenerate the hero car silhouette from a competition side-profile photo.

The home-page particle hero (HeroCanvas.web.tsx) samples its target shape from
assets/car-silhouette.png -- a background-removed, transparent PNG of the car.
This script produces that file from a source photo using rembg (u2net).

Usage:
    pip install rembg onnxruntime pillow
    python dev-assets/extract_car.py [source_image]

Notes:
- dev-assets/ is a working folder and is NOT bundled into the web build.
- Pick a clean, well-lit SIDE profile with the car dark against a lighter
  background for the cleanest cutout. Crop is automatic (alpha bounding box),
  but review the result -- stray objects (cones, people) may need manual cleanup.
"""
import sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

SRC = sys.argv[1] if len(sys.argv) > 1 else "dev-assets/DZ8_9875.JPG"
OUT = "assets/car-silhouette.png"
TARGET_W = 1400          # sampling-friendly width for the particle field
WORK_W = 2200            # downscale before matting to keep it fast

print("loading", SRC, flush=True)
img = Image.open(SRC).convert("RGB")
w, h = img.size
img = img.resize((WORK_W, int(h * WORK_W / w)), Image.LANCZOS)

print("running rembg (u2net)...", flush=True)
out = remove(img, session=new_session("u2net"))  # RGBA, background alpha=0

# Erase leftover ORANGE track-cone pixels (bright orange sliver by the rear
# wheel that rembg keeps). Orange = high R, mid G, low B; this spares the car's
# red/blue sponsor stickers (which have low G).
arr = np.array(out)
r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
orange = (r > 155) & (g > 55) & (g < 175) & (b < 115) & ((r - b) > 75) & ((g - b) > 15)
arr[..., 3][orange] = 0

# Keep only the largest connected component (the car), dropping stray specks
# such as isolated cone fragments left by matting.
from scipy import ndimage
labels, n = ndimage.label(arr[..., 3] > 40)
if n > 1:
    counts = np.bincount(labels.ravel())
    counts[0] = 0  # ignore transparent background
    arr[..., 3][labels != counts.argmax()] = 0
    print("kept largest of", n, "components", flush=True)

out = Image.fromarray(arr, "RGBA")

bbox = out.getchannel("A").getbbox()
print("bbox", bbox, flush=True)
if bbox:
    out = out.crop(bbox)

# A dimmer orange/red cone remnant sits at the car's bottom-right edge, touching
# the rear wheel (so it survives the component filter). Scrub reddish pixels in
# just that corner of the CROPPED car; the black wheel there is untouched.
carr = np.array(out)
cr, cg, cb = carr[..., 0].astype(int), carr[..., 1].astype(int), carr[..., 2].astype(int)
ch, cw = carr.shape[0], carr.shape[1]
yy, xx = np.mgrid[0:ch, 0:cw]
corner = (xx > 0.88 * cw) & (yy > 0.80 * ch)
reddish = (cr > 110) & ((cr - cb) > 40) & ((cr - cg) > 22)
carr[..., 3][corner & reddish] = 0
out = Image.fromarray(carr, "RGBA")
bbox2 = out.getchannel("A").getbbox()
if bbox2:
    out = out.crop(bbox2)

w2, h2 = out.size
out = out.resize((TARGET_W, max(1, int(h2 * TARGET_W / w2))), Image.LANCZOS)
out.save(OUT)
print("saved", OUT, out.size, flush=True)
