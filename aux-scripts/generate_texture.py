import math

import cv2
import numpy as np

def lat_lon_to_web_mercator_tile(lat, lon, zoom):
    """Convert latitude/longitude to Web Mercator tile coordinates at a given zoom level."""
    if lat > 85.0511 or lat < -85.0511:  # Outside valid Web Mercator range
        return -1, -1
    n = 2 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n)
    return x, y

def generate_texture(width, height, zoom):
    """Generate a 8-bit PNG texture encoding Web Mercator tile indices."""
    texture = np.zeros((height, width, 3), dtype=np.uint8)  # 8-bit 3-channel (RGB)

    for j in range(height):
        lat = 90 - (j / height) * 180  # Map pixel row to latitude
        for i in range(width):
            lon = (i / width) * 360 - 180  # Map pixel column to longitude
            x, y = lat_lon_to_web_mercator_tile(lat, lon, zoom)

            if x == -1 and y == -1:
                texture[j, i] = (0, 0, 0)
            else:
                texture[j, i] = (x, y, 0)
    return texture

if __name__ == "__main__":
    min_zoom = 4
    max_zoom = 8
    for zoom in range(min_zoom, max_zoom+1):
        texture = generate_texture(width=1024, height=1024, zoom=zoom)
        cv2.imwrite(f"../public/mercator_texture_zoom_{zoom}.png", texture)
