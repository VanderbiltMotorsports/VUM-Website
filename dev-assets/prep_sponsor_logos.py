"""
Prepare the sponsor logos in dev-assets/sponsor_logos/ for the Sponsorship page.

The originals arrive in mixed shape: SVG, PNG with real alpha, and at least one
JPEG with a baked-in white background. The site renders them on a near-black
card, so this script normalises all of them into transparent WebP:

  1. Rasterise SVGs at a generous width.
  2. Key out a baked-in white background where there's no real alpha channel.
  3. Trim to the alpha bounding box so padding is ours, not the source file's.
  4. Scale so every logo has a similar *optical* size, then export WebP.

Logo colours are left exactly as the sponsor supplied them. Recolouring a mark
to suit our background is a brand decision, not a build step -- if one reads
poorly on the dark page, change the tile behind it rather than the logo.

Optical sizing matters more than it sounds: Speed-Wiz is a 7:1 wordmark and the
Music City Grand Prix mark is nearly square. Fitting both to the same bounding
box makes the wordmark tower over the badge, so we normalise on the geometric
mean of the two sides and only then clamp to the tile.

Usage:
    pip install pillow cairosvg numpy
    python dev-assets/prep_sponsor_logos.py
"""
import io
import os

import numpy as np
from PIL import Image

import cairosvg

SRC = "dev-assets/sponsor_logos"
OUT = "assets/sponsors"

# Rendered at 2x the ~220x100 CSS tile so the logos stay sharp on retina.
TARGET_GEOMEAN = 300   # geometric mean of width/height, before clamping
MAX_W, MAX_H = 440, 200
SVG_RASTER_W = 1600

# source filename -> (output slug, display name used as alt text)
LOGOS = [
    ("26_NSS_CB400.png",                  "cracker-barrel-400",        "Cracker Barrel 400"),
    ("26_NSS_Primary(W) 2.png",           "nashville-superspeedway",   "Nashville Superspeedway"),
    ("AIRTECH Coatings Logo.png",         "airtech-coatings",          "Airtech Coatings"),
    ("Airtech Advanced Materials.jpg",    "airtech-advanced-materials", "Airtech Advanced Materials Group"),
    ("BBMCGP-SecondaryLogo-Colorway1.png", "music-city-grand-prix",    "Borchetta Bourbon Music City Grand Prix"),
    ("Blue Origin.svg",                   "blue-origin",               "Blue Origin"),
    ("Lane Motor Museum.png",             "lane-motor-museum",         "Lane Motor Museum"),
    ("LeoVince.svg",                      "leovince",                  "LeoVince"),
    ("SolidWorks_Logo.svg",               "solidworks",                "Dassault Systemes SOLIDWORKS"),
    ("Speed-Wiz-Logo.png",                "speed-wiz",                 "Speed-Wiz"),
]


def load(path):
    if path.lower().endswith(".svg"):
        png = cairosvg.svg2png(url=path, output_width=SVG_RASTER_W)
        return Image.open(io.BytesIO(png)).convert("RGBA")
    return Image.open(path).convert("RGBA")


def key_out_white(im):
    """Undo a white matte on an image that has no usable alpha channel.

    A logo flattened onto white satisfies observed = true*a + 255*(1-a). Taking
    a = 1 - min(R,G,B)/255 recovers a sensible coverage value (white -> 0, any
    saturated or dark ink -> ~1), which we then divide back out to get the true
    colour. Doing this instead of a luminance threshold keeps anti-aliased edges
    smooth rather than jagged.
    """
    a = np.array(im).astype(float)
    rgb, alpha_in = a[..., :3], a[..., 3]
    if (alpha_in < 250).mean() > 0.02:
        return im  # already has real transparency; leave it alone

    alpha = 255.0 - rgb.min(axis=2)
    alpha[alpha < 10] = 0  # JPEG ringing in the background, not real ink
    out = np.zeros_like(a)
    solid = alpha > 0
    k = (alpha[solid] / 255.0)[..., None]
    out[..., :3][solid] = np.clip((rgb[solid] - 255.0 * (1 - k)) / k, 0, 255)
    out[..., 3] = alpha
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def trim(im):
    box = im.getchannel("A").getbbox()
    return im.crop(box) if box else im


def scale_optically(im):
    w, h = im.size
    s = TARGET_GEOMEAN / (w * h) ** 0.5
    s = min(s, MAX_W / w, MAX_H / h)
    return im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for filename, slug, name in LOGOS:
        src = os.path.join(SRC, filename)
        im = scale_optically(trim(key_out_white(load(src))))
        dst = os.path.join(OUT, slug + ".webp")
        im.save(dst, "WEBP", quality=90, alpha_quality=100, method=6)
        size = os.path.getsize(dst)
        total += size
        print(f"{name:42} {str(im.size):>12}  {size:>7,} B  -> {dst}")
    print(f"{'TOTAL':42} {'':>12}  {total:>7,} B")


if __name__ == "__main__":
    main()
