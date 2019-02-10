import sys
from PIL import Image
import json
from io import BytesIO
import base64
import colorsys

def processImg(number, img):
    image = Image.open(BytesIO(base64.b64decode(img)))
    reducecolors = image.quantize(colors=number)
    pixels = reducecolors.getpalette()[0:number*3]

    palette = [tuple(pixels[i:i + 3]) for i in range(0, len(pixels), 3)]
    hexcolors = list(map(lambda x: '#%02x%02x%02x' % x, palette))
    hls = list(map(lambda x: colorsys.rgb_to_hls(x[0] / 255, x[1] / 255, x[2] / 255), palette))
    hsv = list(map(lambda x: colorsys.rgb_to_hsv(x[0] / 255, x[1] / 255, x[2] / 255), palette))

    return json.dumps({'hex': hexcolors, 'rgb': palette, 'hls': hls, 'hsv': hsv})
