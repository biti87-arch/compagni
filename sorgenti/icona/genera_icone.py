"""Genera icona e splash dell'app (zampa dorata in un anello, fondo verde bosco)
e sostituisce tutte le immagini di Android alle loro dimensioni.
Uso: python3 sorgenti/icona/genera_icone.py"""
import os, math, glob
from PIL import Image, ImageDraw, ImageFilter
R = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(R, '..', '..')
ORO = (212, 172, 94, 255); VERDE1 = (38, 78, 50, 255); VERDE2 = (17, 38, 24, 255); CREMA = (238, 232, 214, 255)

def fondo(n):
    im = Image.new('RGBA', (n, n)); d = ImageDraw.Draw(im)
    for r in range(n // 2 * 142 // 100, 0, -2):
        t = r / (n * 0.71)
        c = tuple(int(VERDE1[i] * (1 - t) + VERDE2[i] * t) for i in range(3)) + (255,)
        d.ellipse([n / 2 - r, n / 2 - r, n / 2 + r, n / 2 + r], fill=c)
    return im

def emblema(n, scala=1.0):
    S = 4; N = n * S; im = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    c = N / 2; R1 = N * 0.40 * scala; w = max(2, int(N * 0.018 * scala))
    d.ellipse([c - R1, c - R1, c + R1, c + R1], outline=ORO, width=w)
    R2 = R1 * 0.88
    d.ellipse([c - R2, c - R2, c + R2, c + R2], outline=ORO, width=max(1, w // 2))
    for k in range(12):
        a = k * math.pi / 6; r = N * 0.012 * scala; x = c + (R1 + R2) / 2 * math.cos(a); y = c + (R1 + R2) / 2 * math.sin(a)
        d.ellipse([x - r, y - r, x + r, y + r], fill=ORO)
    u = R1 / 100.0
    # cuscinetto principale
    d.ellipse([c - 30 * u, c - 2 * u, c + 30 * u, c + 42 * u], fill=ORO)
    d.ellipse([c - 40 * u, c + 10 * u, c - 6 * u, c + 44 * u], fill=ORO)
    d.ellipse([c + 6 * u, c + 10 * u, c + 40 * u, c + 44 * u], fill=ORO)
    # dita
    for (x, y, rx, ry, rot) in [(-42, -16, 12, 16, 20), (-16, -42, 13, 17, 5), (16, -42, 13, 17, -5), (42, -16, 12, 16, -20)]:
        t = Image.new('RGBA', (int(rx * 2 * u) + 4, int(ry * 2 * u) + 4), (0, 0, 0, 0))
        ImageDraw.Draw(t).ellipse([2, 2, rx * 2 * u + 2, ry * 2 * u + 2], fill=ORO)
        t = t.rotate(rot, expand=True, resample=Image.BICUBIC)
        im.alpha_composite(t, (int(c + x * u - t.width / 2), int(c + y * u - t.height / 2)))
    return im.resize((n, n), Image.LANCZOS)

def icona(n, sfondo=True, scala=1.0):
    im = fondo(n) if sfondo else Image.new('RGBA', (n, n), (0, 0, 0, 0))
    im.alpha_composite(emblema(n, scala)); return im

def splash(n, scuro=False):
    im = Image.new('RGBA', (n, n), VERDE2 if scuro else VERDE1)
    e = emblema(n // 3); im.alpha_composite(e, ((n - e.width) // 2, (n - e.height) // 2)); return im

A = os.path.join(ROOT, 'assets'); os.makedirs(A, exist_ok=True)
icona(1024).save(os.path.join(A, 'icon-only.png'))
icona(1024, False, 0.62).save(os.path.join(A, 'icon-foreground.png'))
fondo(1024).save(os.path.join(A, 'icon-background.png'))
splash(2732).save(os.path.join(A, 'splash.png')); splash(2732, True).save(os.path.join(A, 'splash-dark.png'))
icona(192).save(os.path.join(ROOT, 'www', 'icona.png'))
os.makedirs(os.path.join(ROOT, 'desktop'), exist_ok=True); icona(512).save(os.path.join(ROOT, 'desktop', 'icon.png'))
res = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
n = 0
for f in glob.glob(os.path.join(res, '*', '*.png')):
    w, h = Image.open(f).size; b = os.path.basename(f)
    if b.startswith('splash'):
        base = splash(max(w, h), 'night' in f); x = (base.width - w) // 2; y = (base.height - h) // 2
        base.crop((x, y, x + w, y + h)).save(f)
    elif b == 'ic_launcher_foreground.png': icona(w, False, 0.62).save(f)
    elif b == 'ic_launcher_background.png': fondo(w).save(f)
    elif b == 'ic_launcher_round.png':
        im = icona(w); m = Image.new('L', (w, w), 0); ImageDraw.Draw(m).ellipse([0, 0, w - 1, w - 1], fill=255)
        out = Image.new('RGBA', (w, w), (0, 0, 0, 0)); out.paste(im, (0, 0), m); out.save(f)
    elif b == 'ic_launcher.png': icona(w).save(f)
    else: continue
    n += 1
print('immagini Android aggiornate:', n)
