import json,subprocess,wave,io,struct
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parent.parent
source=json.loads((root/'docs/voice-input.json').read_text());translations=source['translations']
more={
'af':'blou|rooi|geel|pers|pienk|turkoois|groen|sirkel|vierkant|driehoek|ster|hart',
'ar':'أزرق|أحمر|أصفر|بنفسجي|وردي|فيروزي|أخضر|دائرة|مربع|مثلث|نجمة|قلب',
'zh':'蓝色|红色|黄色|紫色|粉红色|青色|绿色|圆形|正方形|三角形|星星|心形',
'ja':'あお|あか|きいろ|むらさき|ピンク|ターコイズ|みどり|まる|しかく|さんかく|ほし|ハート',
'ko':'파란색|빨간색|노란색|보라색|분홍색|청록색|초록색|원|정사각형|삼각형|별|하트',
'tr':'mavi|kırmızı|sarı|mor|pembe|turkuaz|yeşil|daire|kare|üçgen|yıldız|kalp',
'pl':'niebieski|czerwony|żółty|fioletowy|różowy|turkusowy|zielony|koło|kwadrat|trójkąt|gwiazda|serce',
'da':'blå|rød|gul|lilla|lyserød|turkis|grøn|cirkel|firkant|trekant|stjerne|hjerte',
'nb':'blå|rød|gul|lilla|rosa|turkis|grønn|sirkel|kvadrat|trekant|stjerne|hjerte',
'fi':'sininen|punainen|keltainen|violetti|vaaleanpunainen|turkoosi|vihreä|ympyrä|neliö|kolmio|tähti|sydän',
'el':'μπλε|κόκκινο|κίτρινο|μοβ|ροζ|τυρκουάζ|πράσινο|κύκλος|τετράγωνο|τρίγωνο|αστέρι|καρδιά',
'hi':'नीला|लाल|पीला|बैंगनी|गुलाबी|फ़िरोज़ी|हरा|गोला|वर्ग|त्रिकोण|तारा|दिल',
'uk':'синій|червоний|жовтий|фіолетовий|рожевий|бірюзовий|зелений|коло|квадрат|трикутник|зірка|серце',
'ro':'albastru|roșu|galben|mov|roz|turcoaz|verde|cerc|pătrat|triunghi|stea|inimă',
'cs':'modrá|červená|žlutá|fialová|růžová|tyrkysová|zelená|kruh|čtverec|trojúhelník|hvězda|srdce',
'he':'כחול|אדום|צהוב|סגול|ורוד|טורקיז|ירוק|עיגול|ריבוע|משולש|כוכב|לב',
'th':'สีน้ำเงิน|สีแดง|สีเหลือง|สีม่วง|สีชมพู|สีเขียวอมฟ้า|สีเขียว|วงกลม|สี่เหลี่ยม|สามเหลี่ยม|ดาว|หัวใจ',
'ms':'biru|merah|kuning|ungu|merah jambu|biru kehijauan|hijau|bulatan|segi empat sama|segi tiga|bintang|hati',
'hr':'plava|crvena|žuta|ljubičasta|ružičasta|tirkizna|zelena|krug|kvadrat|trokut|zvijezda|srce'}
translations.update({k:v.split('|') for k,v in more.items()})
keys=['blue','red','yellow','purple','pink','teal','green','circle','square','triangle','star','heart']
tokens=list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')+[str(i) for i in range(1,21)]+keys
out=root/'dist/assets/voices';out.mkdir(parents=True,exist_ok=True)
voices={'en-US':'en-us','en-GB':'en-gb','pt-PT':'pt','pt-BR':'pt-br','zh-CN':'cmn'}
def build(locale):
 voice=voices.get(locale,locale.split('-')[0]);words=list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')+[str(i) for i in range(1,21)]+translations.get(locale.split('-')[0],keys)
 cues={};pcm=bytearray();rate=22050
 for key,word in zip(tokens,words):
  data=subprocess.check_output(['espeak-ng','-v',voice,'-s','130','-a','150','--stdout',word],stderr=subprocess.DEVNULL)
  with wave.open(io.BytesIO(data)) as w:
   assert w.getframerate()==rate and w.getnchannels()==1
   frames=w.readframes(w.getnframes())
  start=len(pcm)/2/rate;pcm.extend(frames);end=len(pcm)/2/rate;cues[key]=[round(start,5),round(end-start,5)];pcm.extend(b'\0\0'*int(rate*.15))
 wav=io.BytesIO()
 with wave.open(wav,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(pcm)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i','pipe:0','-codec:a','libmp3lame','-b:a','48k',str(out/(locale+'.mp3'))],input=wav.getvalue(),check=True)
 print(locale,'58 bundled prompts',flush=True);return locale,{'file':'assets/voices/'+locale+'.mp3','cues':cues}
manifest=dict(ThreadPoolExecutor(6).map(build,[x[1] for x in source['languages']]))
(root/'dist/voice-manifest.js').write_text('window.BALLOON_VOICES='+json.dumps(manifest,ensure_ascii=False)+';\n')
(root/'dist/voice-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(root/'docs/voice-words.json').write_text(json.dumps(translations,ensure_ascii=False,indent=2))
