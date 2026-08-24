"""
Regenerate the inline SVG paths in Icon.web.tsx from the icon fonts.

The site used to ship four @expo/vector-icons TTFs (~350 KB gzipped) in order to
draw seven glyphs. This script pulls those exact glyph outlines out of the fonts
in node_modules and prints them as SVG path data, normalised into a 24x24 box,
so Icon.web.tsx can draw them inline instead.

Usage:
    pip install fonttools
    python dev-assets/extract_icons.py

Paste the output into the PATHS map in Icon.web.tsx. Codepoints come from
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/.

Note: @expo/vector-icons is no longer a dependency, so `npm install` it
temporarily (or check out an older commit) before running this.
"""
import re

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONTS = "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/"

# (name in Icon.web.tsx, font file, codepoint from the matching glyphmap)
ICONS = [
    ("anchor",    "Feather.ttf",             0xF109),
    ("mail",      "Feather.ttf",             0xF196),
    ("edit",      "Feather.ttf",             0xF161),  # Feather "edit-3"
    ("heart",     "Feather.ttf",             0xF181),
    ("linkedin",  "FontAwesome6_Brands.ttf", 0xF08C),
    ("instagram", "FontAwesome6_Brands.ttf", 0xF16D),
    ("tiktok",    "FontAwesome6_Brands.ttf", 0xE07B),
]

BOX = 24.0   # SVG viewBox is "0 0 24 24"
PAD = 1.0    # keep a little air around each glyph


def glyph_path(font_file: str, codepoint: int) -> str:
    font = TTFont(FONTS + font_file)
    glyphs = font.getGlyphSet()
    glyph = glyphs[font.getBestCmap()[codepoint]]

    bounds = BoundsPen(glyphs)
    glyph.draw(bounds)
    x0, y0, x1, y1 = bounds.bounds
    w, h = x1 - x0, y1 - y0

    # Scale the longest side to fit the padded box so every icon reads as the
    # same optical size, then flip Y (fonts are Y-up, SVG is Y-down) and centre.
    s = (BOX - 2 * PAD) / max(w, h)
    t = Transform().translate(
        (BOX - w * s) / 2 - x0 * s,
        (BOX + h * s) / 2 + y0 * s,
    ).scale(s, -s)

    pen = SVGPathPen(glyphs)
    glyph.draw(TransformPen(pen, t))
    # Two decimal places is well below a pixel at the sizes we render.
    return re.sub(r"-?\d+\.\d+", lambda m: "%g" % round(float(m.group()), 2), pen.getCommands())


if __name__ == "__main__":
    for name, font_file, codepoint in ICONS:
        print(f"  {name}:\n    '{glyph_path(font_file, codepoint)}',")
