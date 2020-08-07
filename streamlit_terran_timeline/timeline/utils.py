import base64
import io
import math
import re

import numpy as np
from PIL import Image


def pad_to_size(image, size):
    width, height = size
    diff_height = max(0, (height - image.shape[0]) / 2)
    diff_width = max(0, (width - image.shape[1]) / 2)

    return np.pad(
        image,
        [
            (int(math.ceil(diff_height)), int(math.floor(diff_height))),
            (int(math.ceil(diff_width)), int(math.floor(diff_width))),
            (0, 0),
        ],
    )


def crop_expanded_pad(image, bbox, large_side=224, factor=0.3):
    x_min, y_min, x_max, y_max = bbox

    width = x_max - x_min
    height = y_max - y_min

    expand_width_by = width * factor
    if width < height:
        expand_width_by += (height - width) / 2

    x_min = int(max(0, x_min - expand_width_by))
    x_max = int(max(0, x_max + expand_width_by))
    new_width = x_max - x_min

    expand_height_by = height * factor
    if height < width:
        expand_height_by += (width - height) / 2

    y_min = int(max(0, y_min - expand_height_by))
    y_max = int(max(0, y_max + expand_height_by))
    new_height = y_max - y_min

    scale = large_side / max(new_width, new_height)

    cropped_face = Image.fromarray(image[y_min:y_max, x_min:x_max, :])

    # Resize faces but only to make them smaller.
    cropped_face = cropped_face.resize(
        (int(new_width * scale), int(new_height * scale))
    )

    return pad_to_size(np.asarray(cropped_face), (large_side, large_side))


def to_base64(image):
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image)

    buff = io.BytesIO()
    image.save(buff, format="JPEG")

    return base64.b64encode(buff.getvalue()).decode("utf-8")


def get_video_id(url):
    youtube_regex = r"((?<=(v|V)/)|(?<=be/)|(?<=(\?|\&)v=)|(?<=embed/))([\w-]+)"
    match = re.search(youtube_regex, url)

    if match:
        return match.group(0)

    return "video"


def get_thumbnail(image, thumbnail_width=128):
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image)

    h, w = image.size
    w_percent = float(thumbnail_width / w)
    thumbnail_height = int(h * w_percent)

    return np.asarray(
        image.resize((thumbnail_width, thumbnail_height), Image.ANTIALIAS)
    )
