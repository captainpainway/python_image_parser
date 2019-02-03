import sys
from PIL import Image
import json
from io import BytesIO
import base64

def processImg(number, img):
    image = Image.open(BytesIO(base64.b64decode(img)))
    reducecolors = image.quantize(colors=number)
    pixels = reducecolors.getpalette()[0:number*3]

    palette = [tuple(pixels[i:i + 3]) for i in range(0, len(pixels), 3)]
    hexcolors = list(map(lambda x: '#%02x%02x%02x' % x, palette))

    return json.dumps(hexcolors)
