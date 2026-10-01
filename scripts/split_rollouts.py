"""Extract the two demonstrations, excluding the slide transition between them."""
from pathlib import Path
import argparse,subprocess,json
p=argparse.ArgumentParser();p.add_argument('--ffmpeg',default='ffmpeg');args=p.parse_args()
root=Path(__file__).resolve().parents[1];src=root/'dist/assets/videos/output.mp4';dest=src.parent/'rollouts';dest.mkdir(exist_ok=True)
# Original is 739 frames at 30 fps. Frames 285–303 contain the slide transition.
segments=[('state-persistence',0,285,(100,80,760,436)),('independent-control',304,739,(0,110,960,406))]
report=[]
for name,start,end,crop in segments:
 x,y,width,height=crop
 out=dest/f'{name}-cropped.mp4'
 subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(src),'-vf',f'trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,crop={width}:{height}:{x}:{y}','-an','-r','30','-fps_mode','cfr','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],check=True)
 subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(out),'-frames:v','1','-q:v','3',str(out.with_suffix('.jpg'))],check=True)
 report.append({'name':name,'file':out.name,'crop':{'x':x,'y':y,'width':width,'height':height},'start_frame':start,'end_frame_exclusive':end,'frames':end-start,'seconds':(end-start)/30,'bytes':out.stat().st_size})
(root/'scripts/rollout-segments.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
