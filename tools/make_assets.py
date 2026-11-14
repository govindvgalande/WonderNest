"""Create original vector-inspired kid-friendly artwork and original synthesized musical sounds. No downloaded assets."""
from PIL import Image,ImageDraw,ImageFilter
import math,random,wave,struct,os
random.seed(29)
os.makedirs('assets/art',exist_ok=True)
# Original illustrated environment, drawn from shapes; all created in this project.
def art(w,h,name,horizon,palette):
 im=Image.new('RGB',(w,h));px=im.load()
 for y in range(h):
  frac=y/h
  c=tuple(round(palette[0][k]*(1-frac)+palette[1][k]*frac) for k in range(3))
  for x in range(w):px[x,y]=c
 d=ImageDraw.Draw(im,'RGBA')
 for _ in range(65):
  x=random.randint(0,w);y=random.randint(0,int(h*.67));r=random.randint(2,6)
  d.ellipse((x-r,y-r,x+r,y+r),fill=(255,251,232,random.randint(80,180)))
 d.ellipse((int(w*.72),int(h*.12),int(w*.89),int(h*.25)),fill=(255,246,190,230))
 if name=='forest':
  d.ellipse((-120,h*.67,w+120,h*1.2),fill=(78,163,128,255))
  for x,y,s in [(75,h*.50,1),(w*.80,h*.49,1.25),(w*.43,h*.70,.8)]:
   d.rounded_rectangle((x-11*s,y,x+11*s,y+120*s),radius=10,fill=(117,95,94,255))
   for a,b,r in [(-26,-10,55),(23,-40,65),(-35,-70,50)]:
    d.ellipse((x+a*s-r*s,y+b*s-r*s,x+a*s+r*s,y+b*s+r*s),fill=(67,142,120,255))
 elif name=='rainbow':
  d.ellipse((-180,h*.72,w+180,h*1.2),fill=(255,219,155,255))
  for i,col in enumerate([(251,120,129,180),(252,180,98,180),(245,230,119,180),(118,211,170,180),(126,170,251,180),(182,148,227,180)]):
   inset=i*27
   d.arc((-w*.10+inset,h*.30+inset,w*1.12-inset,h*1.8-inset),180,360,fill=col,width=22)
 elif name=='treasure':
  d.ellipse((-120,h*.72,w+120,h*1.2),fill=(246,187,122,255))
  d.polygon([(w*.20,h*.79),(w*.48,h*.50),(w*.65,h*.79)],fill=(190,153,132,250))
  d.rounded_rectangle((w*.61,h*.77,w*.79,h*.88),radius=14,fill=(145,89,65,255),outline=(255,221,112,255),width=6)
 elif name=='castle':
  d.ellipse((-120,h*.72,w+120,h*1.2),fill=(141,159,194,255))
  d.rectangle((w*.35,h*.45,w*.7,h*.78),fill=(133,126,174,255))
  for x in [w*.36,w*.62]:
   d.rectangle((x,h*.36,x+w*.07,h*.78),fill=(116,112,163,255));d.polygon([(x-10,h*.38),(x+w*.035,h*.27),(x+w*.08,h*.38)],fill=(233,147,160,255))
 elif name=='mountain':
  d.polygon([(-70,h*.84),(w*.3,h*.36),(w*.65,h*.84)],fill=(142,170,177,255))
  d.polygon([(w*.28,h*.84),(w*.7,h*.27),(w+80,h*.84)],fill=(113,147,164,255))
  d.polygon([(w*.55,h*.46),(w*.7,h*.27),(w*.83,h*.46)],fill=(245,247,252,250))
 im.save(f'assets/art/{name}.png',optimize=True)
art(900,500,'forest',.6,[(205,240,224),(131,199,203)])
art(900,500,'rainbow',.6,[(243,218,247),(178,219,252)])
art(900,500,'treasure',.6,[(255,229,201),(245,195,165)])
art(900,500,'castle',.6,[(227,219,248),(175,200,237)])
art(900,500,'mountain',.6,[(218,241,251),(178,208,215)])
# Mascot fox illustration, vector-like shapes on transparent backing
im=Image.new('RGBA',(1024,1024),(0,0,0,0));d=ImageDraw.Draw(im)
d.ellipse((200,715,850,960),fill='#e8bb85')
d.polygon([(250,380),(170,80),(425,210)],fill='#e77b55')
d.polygon([(590,215),(835,80),(770,405)],fill='#e77b55')
d.polygon([(250,325),(230,155),(365,254)],fill='#eebea9')
d.polygon([(655,262),(775,155),(762,359)],fill='#eebea9')
d.ellipse((175,180,850,855),fill='#ea895c')
d.ellipse((270,445,755,862),fill='#fff1d9')
d.ellipse((340,435,400,505),fill='#464158');d.ellipse((624,435,684,505),fill='#464158')
d.ellipse((360,450,379,469),fill='white');d.ellipse((645,450,664,469),fill='white')
d.polygon([(482,575),(551,575),(517,620)],fill='#4a4559')
d.arc((446,605,587,680),0,180,fill='#4a4559',width=9)
d.ellipse((255,590,325,634),fill='#eea8a2');d.ellipse((710,590,780,634),fill='#eea8a2')
im.save('assets/art/fox.png',optimize=True)
# App icon: rounded grassy world with mascot
base=Image.new('RGBA',(1024,1024),'#e8f8ef');d=ImageDraw.Draw(base)
d.ellipse((-250,660,1250,1550),fill='#9bd9b7')
d.ellipse((700,110,840,250),fill='#ffd583')
fox=Image.open('assets/art/fox.png');fox.thumbnail((790,790));base.alpha_composite(fox,((1024-fox.width)//2,130))
base.convert('RGB').save('assets/icon.png',optimize=True)
base.resize((512,512)).save('assets/adaptive-icon.png',optimize=True)
Image.open('assets/art/forest.png').resize((1024,500)).save('assets/feature-graphic.png',optimize=True)
# Splash generated from same original character
splash=Image.new('RGB',(1080,1920),'#e8f8ef');splash.paste(base.convert('RGB').resize((930,930)),(75,300));splash.save('assets/splash.png',optimize=True)
# Original no-microphone audio notes, 6 distinct timbres & success sound.
frequency={'bell':660,'drum':165,'flute':880,'chime':1174,'harp':523,'wood':240,'success':784}
for name,root in frequency.items():
 rate=22050;duration=.48 if name!='success' else .85
 values=[]
 for i in range(int(rate*duration)):
  sec=i/rate;attack=min(1,sec/.018);decay=math.exp(-sec*(4.8 if name!='success' else 2.4));env=attack*decay
  freq=root*(1+(.12*math.exp(-sec*12) if name=='drum' else 0))
  if name=='wood':waveform=math.sin(2*math.pi*freq*sec)+.5*math.sin(2*math.pi*freq*3*sec)
  elif name=='bell':waveform=math.sin(2*math.pi*freq*sec)+.48*math.sin(2*math.pi*freq*2.8*sec)
  elif name=='flute':waveform=math.sin(2*math.pi*freq*sec)+.1*math.sin(2*math.pi*freq*2*sec)
  elif name=='success':waveform=math.sin(2*math.pi*(root+120*sec)*sec)+.2*math.sin(2*math.pi*root*2*sec)
  else:waveform=math.sin(2*math.pi*freq*sec)+.25*math.sin(2*math.pi*freq*2*sec)
  values.append(int(max(-1,min(1,waveform*.28*env))*32767))
 with wave.open(f'assets/sounds/{name}.wav','wb') as wav:
  wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(struct.pack('<'+'h'*len(values),*values))
print('Created illustrations and 7 original sound files.')

# 12-second original gentle pentatonic lullaby, loopable with quiet transitions.
rate=11025;duration=12;freqs=[392,440,523.25,587.33,659.25,523.25,440,392,349.23,392,523.25,440]
values=[]
for i in range(rate*duration):
 sec=i/rate;bar=int(sec)%len(freqs);local=sec%1;freq=freqs[bar]
 fade=min(1,sec/.25,(duration-sec)/.25);env=max(0,fade)*(math.sin(math.pi*local)**1.5)*.16
 value=math.sin(2*math.pi*freq*sec)+.16*math.sin(2*math.pi*2*freq*sec)
 # subtle drone
 value=value*env+.018*fade*math.sin(2*math.pi*196*sec)
 values.append(int(max(-1,min(1,value))*32767))
with wave.open('assets/sounds/music.wav','wb') as wav:
 wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(struct.pack('<'+'h'*len(values),*values))
