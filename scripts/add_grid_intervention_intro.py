"""Build a moving 4×4 results grid, blurred title overlay, and a short dissolve."""
from pathlib import Path
import argparse
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
assets = root / 'dist/assets/videos'
previews = root / 'previews'
previews.mkdir(exist_ok=True)
overlay = previews / 'figure-5-grid-title-overlay-v4.png'
output = assets / 'figure-5-intervention-grid-intro-v4.mp4'
width, height = 1664, 960
# A gentle navy veil keeps the moving grid visible and the white type legible.
y, x = np.mgrid[:height, :width]
center_weight = np.exp(-(((x-width/2)/(width*.58))**2 + ((y-height/2)/(height*.55))**2))
rgba = np.zeros((height, width, 4), dtype=np.uint8)
rgba[:, :, :3] = (10, 18, 35)
rgba[:, :, 3] = (115 + 62*center_weight).astype(np.uint8)
image = Image.fromarray(rgba)
draw = ImageDraw.Draw(image)
font_dir = Path('/System/Library/Fonts/Supplemental')
def centered(text, top, size, color='#ffffff', bold=False):
    font = ImageFont.truetype(str(font_dir / ('Arial Bold.ttf' if bold else 'Arial.ttf')), size)
    bounds = draw.textbbox((0, 0), text, font=font)
    left = (width - (bounds[2] - bounds[0])) / 2 - bounds[0]
    draw.text((left, top-bounds[1]), text, fill=color, font=font)

def colored_line(parts, top, size):
    font = ImageFont.truetype(str(font_dir / 'Arial Bold.ttf'), size)
    total = sum(draw.textlength(text, font=font) for text, _ in parts)
    left = (width-total)/2
    baseline_offset = draw.textbbox((0, 0), ''.join(text for text, _ in parts), font=font)[1]
    for text, color in parts:
        draw.text((left, top-baseline_offset), text, font=font, fill=color)
        left += draw.textlength(text, font=font)

colored_line([('Uni', '#ffffff'), ('State', '#90c5ff')], 205, 132)
colored_line([('Unifying ', '#ffffff'), ('Memory', '#90c5ff'),
              (' and ', '#ffffff'), ('Intervention', '#8de5cf')], 395, 56)
centered('for Controllable World Simulation', 467, 56, bold=True)
centered('Jaeseok Jeong¹˒²  ·  Kyungmook Choi¹  ·  Sohyun Chung¹', 597, 33)
centered('Youngsik Yun¹  ·  Youngjung Uh¹', 648, 33)
centered('¹ Yonsei University     ² Familiar', 721, 28, '#dce4f4')
image.save(overlay)

clips = [assets / f'figure-3_{letter}-vis.mp4' for letter in 'abfcdegh']
clips.append(assets / 'figure-3_b-gap-patch-revisit-figure3-vis-matched.mp4')
for filename in [
    'project-deliver_robot-om_001_cm_001-vis.mp4',
    'project-rabbit_tumbler-om_001_cm_000-vis.mp4',
    'project-robot_hand_with_block-om_001_cm_001-vis.mp4',
    'project-supermarket_ask_robot-om_001_cm_002-vis.mp4',
    'project-tissue_box-om_001_cm_002-vis.mp4',
    'project-toy_car_and_flower-om_001_cm_001-vis.mp4',
    'project-car_show-om_001_cm_001-vis.mp4',
]:
    clips.append(assets / 'more' / filename)
assert len(clips) == 16 and all(clip.is_file() for clip in clips)
command = [args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-filter_complex_threads', '2']
for clip in clips:
    command += ['-i', str(clip)]
command += ['-loop', '1', '-framerate', '32', '-t', '4.5', '-i', str(overlay),
            '-i', str(assets / 'figure-5-intervention.mp4')]
filters = []
for i in range(16):
    filters.append(f'[{i}:v]trim=duration=4.5,setpts=PTS-STARTPTS,fps=32,'
                   f'scale=416:240:force_original_aspect_ratio=increase,crop=416:240,'
                   f'setsar=1,format=yuv420p[t{i}]')
layout = '|'.join(f'{col*416}_{row*240}' for row in range(4) for col in range(4))
filters += [
    ''.join(f'[t{i}]' for i in range(16)) + f'xstack=inputs=16:layout={layout}:shortest=1,'
    'gblur=sigma=5:steps=2[grid]',
    '[grid][16:v]overlay=0:0:shortest=1,fps=32,format=yuv420p,setpts=PTS-STARTPTS,fps=32[intro]',
    '[17:v]fps=32,setsar=1,format=yuv420p,setpts=PTS-STARTPTS,fps=32[demo]',
    '[intro][demo]xfade=transition=fade:duration=0.5:offset=4,format=yuv420p[out]',
]
command += ['-filter_complex', ';'.join(filters), '-map', '[out]', '-an',
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
            '-r', '32', '-movflags', '+faststart', str(output)]
subprocess.run(command, check=True)
for label, time in [('title', 2), ('transition', 4.25), ('main', 4.6)]:
    subprocess.run([args.ffmpeg, '-v', 'error', '-y', '-ss', str(time), '-i', str(output),
                    '-frames:v', '1', '-update', '1', str(previews / f'figure-5-grid-{label}-v4.png')], check=True)
print(output)
