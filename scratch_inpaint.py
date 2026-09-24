import cv2
import numpy as np

orig_path = r'C:\Users\HarisH\.gemini\antigravity-ide\brain\522b2853-7100-4a8c-9e9d-3bf3c9b917b3\.user_uploaded\media_1790240699697.jpg'
img = cv2.imread(orig_path)
h, w, _ = img.shape
print(f"Original dimensions: {w}x{h}")

# The contrail starts at x=0, y=232 and runs to x=325, y=232 (thickness ~ 4-6px).
# The airplane is at x: 310 to 425, y: 195 to 255.

mask = np.zeros((h, w), dtype=np.uint8)

# 1. Contrail strip: from x=0 to x=330, y=228 to y=238
cv2.line(mask, (0, 233), (330, 233), 255, 8)

# 2. Airplane region: x: 310 to 425, y: 195 to 255
# Let's create a filled polygon / convex hull or circle covering the entire airplane including wheels, wings, tail
plane_poly = np.array([
    [315, 215],
    [330, 205],
    [380, 195],
    [415, 205],
    [425, 230],
    [415, 255],
    [380, 255],
    [350, 250],
    [315, 240]
], dtype=np.int32)
cv2.fillPoly(mask, [plane_poly], 255)

# Slightly dilate mask by 3px for perfect seamless edge blending
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
mask = cv2.dilate(mask, kernel, iterations=2)

# Use INPAINT_NS (Navier-Stokes) and INPAINT_TELEA
inpainted = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_NS)

out_path = r'd:\Hariharan R\Lucky charm site\public\assets\wallpaper.jpg'
cv2.imwrite(out_path, inpainted, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
print("Successfully generated clean wallpaper at:", out_path)
