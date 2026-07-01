from PIL import Image, ImageDraw

SIZE = 512
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 배경: 보라 -> 남색 그라디언트, 살짝 라운드된 사각형(maskable 안전영역 고려해 꽉 채움)
top = (168, 85, 247)     # #a855f7
bottom = (10, 10, 18)    # #0a0a12
for y in range(SIZE):
    t = y / SIZE
    r = int(top[0] * (1 - t) + bottom[0] * t)
    g = int(top[1] * (1 - t) + bottom[1] * t)
    b = int(top[2] * (1 - t) + bottom[2] * t)
    draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

cx, cy = SIZE // 2, SIZE // 2 + 10

# 조이스틱 베이스(둥근 사각형)
base_w, base_h = 300, 170
base_x0, base_y0 = cx - base_w // 2, cy + 30
base_x1, base_y1 = cx + base_w // 2, base_y0 + base_h
draw.rounded_rectangle([base_x0, base_y0, base_x1, base_y1], radius=40, fill=(15, 15, 25, 255))

# 십자 방향키 (좌측)
dpad_cx, dpad_cy = cx - 78, base_y0 + base_h // 2
arm = 26
length = 78
draw.rounded_rectangle([dpad_cx - arm, dpad_cy - length // 2, dpad_cx + arm, dpad_cy + length // 2], radius=10, fill=(226, 232, 240, 255))
draw.rounded_rectangle([dpad_cx - length // 2, dpad_cy - arm, dpad_cx + length // 2, dpad_cy + arm], radius=10, fill=(226, 232, 240, 255))

# 액션 버튼 2개 (우측)
btn_r = 26
draw.ellipse([cx + 55 - btn_r, dpad_cy - 34 - btn_r, cx + 55 + btn_r, dpad_cy - 34 + btn_r], fill=(251, 191, 36, 255))
draw.ellipse([cx + 105 - btn_r, dpad_cy + 10 - btn_r, cx + 105 + btn_r, dpad_cy + 10 + btn_r], fill=(74, 222, 128, 255))

# 상단 조이스틱 스틱
stick_cx, stick_cy = cx, base_y0 - 55
draw.ellipse([stick_cx - 46, stick_cy - 46, stick_cx + 46, stick_cy + 46], fill=(56, 189, 248, 255))
draw.rectangle([stick_cx - 14, stick_cy + 30, stick_cx + 14, base_y0 + 20], fill=(30, 30, 46, 255))

img.save("public/icon-512.png")
img.resize((192, 192), Image.LANCZOS).save("public/icon-192.png")
print("done")
