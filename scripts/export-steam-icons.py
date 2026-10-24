from PIL import Image,ImageOps
from pathlib import Path
import json,zipfile,io
out=Path('dist/releases/steam-achievement-icons.zip');out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for d in json.loads(Path('dist/achievement-definitions.json').read_text()):
  im=Image.open('dist/assets/achievements/'+d['art']+'.png').convert('RGB').resize((256,256))
  for suffix,img in [('',im),('-locked',ImageOps.grayscale(im))]:
   b=io.BytesIO();img.save(b,format='PNG');z.writestr(d['id']+suffix+'.png',b.getvalue())
