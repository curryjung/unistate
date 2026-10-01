"""Build frame-aligned comparison grids. Run with an FFmpeg executable argument."""
from pathlib import Path
import argparse, json, subprocess
p=argparse.ArgumentParser(); p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--font',default='/System/Library/Fonts/Supplemental/Arial.ttf');args=p.parse_args()
root=Path(__file__).resolve().parents[1]; source=root/'dist/assets/videos'; out=source/'comparisons';out.mkdir(exist_ok=True)
methods=['Ours','VerseCrafter','WorldDirector','MotionCanvas','SymphoMotion','Real2SAM2Real']
report=[]
for seq in range(5,9):
 inputs=[source/f'figure-{seq}-{method}.mp4' for method in methods]
 cmd=[args.ffmpeg,'-hide_banner','-loglevel','error','-y']
 for f in inputs:cmd += ['-i',str(f)]
 filters=[]
 for i,method in enumerate(methods):
  label='UniState (Ours)' if method=='Ours' else method
  color='0x2550df' if i==0 else '0x142139'
  filters.append(f"[{i}:v]setpts=PTS-STARTPTS,scale=520:300:flags=lanczos,setsar=1,pad=528:344:4:40:color=white,drawtext=fontfile='{args.font}':text='{label}':fontsize=21:fontcolor={color}:x=(w-text_w)/2:y=10[v{i}]")
 filters.append(''.join(f'[v{i}]' for i in range(6))+'xstack=inputs=6:layout=0_0|528_0|1056_0|0_344|528_344|1056_344:shortest=0[grid]')
 dest=out/f'sequence-{seq-4}.mp4'
 cmd += ['-filter_complex',';'.join(filters),'-map','[grid]','-an','-r','16','-fps_mode','cfr','-c:v','libx264','-preset','slow','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)]
 subprocess.run(cmd,check=True)
 subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(dest),'-frames:v','1','-q:v','3',str(dest.with_suffix('.jpg'))],check=True)
 report.append({'sequence':seq-4,'original_bytes':sum(x.stat().st_size for x in inputs),'composite_bytes':dest.stat().st_size,'size':[1584,688],'fps':16})
 print(json.dumps(report[-1]),flush=True)
(root/'scripts/comparison-encoding.json').write_text(json.dumps(report,indent=2)+'\n')
