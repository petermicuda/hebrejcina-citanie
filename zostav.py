#!/usr/bin/env python3
"""Zostaví index.html aplikácie Hebrejčina – čítanie.

Zdroje (v priečinku src/):
  obsah.html   – texty lekcií a cvičení (sekcie <h2 id="s0"> … <h2 id="s27">)
  sablona.html – kostra stránky (lišta, úvod, okná); značky {{CSS}}, {{STRANY}}, {{OBSAH}}, {{MRIEZKA}}, {{META}}, {{JS}}
  app.css, app.js
Použitie: python3 zostav.py   (výsledok: index.html)
"""
import json, re, html

SRC = 'src/'
obsah = open(SRC + 'obsah.html', encoding='utf-8').read()

# ---------- rozdelenie obsahu na sekcie ----------
casti = re.split(r'(?=<h2 id="s\d+">)', obsah)
sek = {}
for c in casti:
    m = re.match(r'<h2 id="(s\d+)">(.*?)</h2>(.*)', c, re.S)
    if m:
        sek[m.group(1)] = (m.group(2), m.group(3).strip())

def text(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', h))).strip()

def nb(t):
    """jednopísmenové predložky a spojky viaže k nasledujúcemu slovu"""
    return re.sub(r'(^|[\s(„])([aiksouvzAIKSOUVZ]) ', lambda m: m.group(1) + m.group(2) + ' ', t)

def he_spans(h):
    return re.findall(r'<span class="he" lang="he">(.*?)</span>', h)

def podla_h3(telo):
    """rozdelí telo sekcie na bloky začínajúce <h3>"""
    kusy = re.split(r'(?=<h3>)', telo)
    return [k for k in kusy if k.strip()]

AB = 'אָלֶף־בֵּית'
AM = 'עֲמִידָה'
CH = 'חֲזָרָה'
KR = 'קְרִיאָה'
NK = 'נִקּוּד'

P = []   # strany: dict(id, sk, grp, pill, tit, kr, desc, pis, he, kon, ser, num)
OBS = {}  # id strany -> html obsahu

# lekcie 1–11
for k in range(11):
    h2, telo = sek[f's{k}']
    m = re.match(r'Lekcia (\d+):\s*(.*)', h2, re.S)
    n = int(m.group(1))
    popis = m.group(2).replace(' · samohlásky ', ' · ').replace(' · samohláska ', ' · ')
    pid = f'l{n}'
    P.append(dict(id=pid, grp='Písmená a samohlásky', pill=str(n), tit=f'Lekcia {n}', kr=f'Lekcia {n}',
                  desc=popis, pis=' '.join(he_spans(h2)), he=AB, kon=f'Koniec lekcie {n}', ser='l', num=n))
    OBS[pid] = telo

def pridaj(pid, s, grp, tit, kr, desc, he, kon, pill='', ser='', num=None, telo=None):
    P.append(dict(id=pid, grp=grp, pill=pill, tit=tit, kr=kr, desc=desc, pis='', he=he, kon=kon, ser=ser, num=num))
    OBS[pid] = telo if telo is not None else sek[s][1]

pridaj('prehlad', 's11', 'Opakovanie', 'Prehľad', 'Prehľad', 'Koncové písmená, dageš, podobné písmená', CH, 'Koniec prehľadu')
pridaj('s3', 's12', 'Opakovanie', 'Opakovanie 1', 'Opakovanie 1', 'Písmená a samohlásky · cvičebnica s. 3', CH, 'Koniec opakovania 1', '1', 'op', 1)
pridaj('s4', 's13', 'Opakovanie', 'Opakovanie 2', 'Opakovanie 2', 'Koncové písmená a dageš · cvičebnica s. 4', CH, 'Koniec opakovania 2', '2', 'op', 2)
b5 = podla_h3(sek['s14'][1])
pridaj('s5a', 's14', 'Opakovanie', 'Opakovanie 3', 'Opakovanie 3', 'Podobne znejúce písmená · cvičebnica s. 5', CH, 'Koniec opakovania 3', '3', 'op', 3, telo=b5[0])
pridaj('s5b', 's14', 'Opakovanie', 'Opakovanie 4', 'Opakovanie 4', 'Podobne vyzerajúce písmená · cvičebnica s. 5', CH, 'Koniec opakovania 4', '4', 'op', 4, telo=''.join(b5[1:]))
pridaj('pravidla', 's15', 'Čítanie', 'Pravidlá čítania', 'Pravidlá čítania', 'Ševa, kamac katan, dageš a ďalšie pravidlá', KR, 'Koniec časti')

# Amida po častiach
am = sek['s16'][1]
uvod_am, *bloky = re.split(r'(?=<h3>)', am)
def najdi(nazov):
    for b in bloky:
        if b.startswith('<h3>' + nazov):
            return b
    raise SystemExit('Amida: chýba časť ' + nazov)
AMI = [
    ('Avot ve-imahot', 'Úvod a 1. požehnanie – otcovia a matky', uvod_am + najdi('Úvod') + najdi('Avot')),
    ('Gevurot', 'Božia moc', re.sub(r'^<h3>.*?</h3>', '', najdi('Gevurot'))),
    ('Keduša', 'Svätosť Božieho mena', najdi('Keduša') + najdi('Kedušat')),
    ('Šabat', 'Šabatové časti Amidy', re.sub(r'^<h3>.*?</h3>', '', najdi('Šabat'))),
    ('Hodaa a Šalom', 'Vďaka a pokoj · otázky', najdi('Hodaa') + najdi('Šalom') + najdi('Otázky')),
]
for i, (t, d, telo) in enumerate(AMI, 1):
    pridaj(f'amida{i}', 's16', f'Amida · {i} z 5', t, f'Amida {i}/5', d, AM,
           'Koniec Amidy' if i == 5 else f'Koniec časti {i} z 5', telo=telo, ser='am', num=i)

# Cvičné čítanie (v cvičebnici „Big Practice“) – číslujeme po poradí, strana cvičebnice je v popise
STR_CC = {}
for k in range(17, 26):
    h2, telo = sek[f's{k}']
    m = re.match(r'(?:Final )?Big Practice – strana (\d+):\s*(.*)', text(h2))
    n = k - 16
    strana = int(m.group(1))
    d = m.group(2)
    d = d[0].upper() + d[1:]
    if k == 25:
        d = 'Záverečné cvičenie: ' + d[0].lower() + d[1:]
    STR_CC[n] = strana
    pridaj(f'cc{n}', None, 'Cvičné čítanie', f'Cvičné čítanie {n}', f'Cvičné čítanie {n}', d + f' · cvičebnica s. {strana}', AM,
           f'Koniec cvičenia {n}', str(n), 'cc', n, telo=telo)

pridaj('abeceda', 's26', 'Prehľady', 'Celá abeceda', 'Celá abeceda', 'Písmená, názvy a výslovnosť', AB, 'Koniec časti')
pridaj('samohlasky', 's27', 'Prehľady', 'Samohlásky', 'Samohlásky', 'Nikud – znamienka pod a nad písmenami', NK, 'Koniec časti')

for p in P:
    p['desc'] = nb(p['desc'])

# ---------- strany ----------
strany = []
for p in P:
    telo = OBS[p['id']]
    # podnadpisy v strane: odstrániť anglické zátvorky a pripraviť na štýl
    strany.append(f'<article class="paper" id="p-{p["id"]}" data-p="{p["id"]}" hidden>'
                  f'<header class="otv"></header><div class="telo">{telo}</div><footer class="koniec"></footer></article>')

# ---------- obsah (okno) ----------
def pol(p, c, sub=None):
    small = sub if sub is not None else p['desc']
    return (f'<a href="#{p["id"]}" class="obPol" data-p="{p["id"]}"><span class="obC">{c}</span>'
            f'<span class="obT"><b>{nb(p["tit"])}</b><small>{small}</small></span></a>')

def skupina(nazov, pozn, polozky):
    return (f'<section class="obSk"><h3 class="obSkN">{nb(nazov)}' + (f'<span>{pozn}</span>' if pozn else '') +
            '</h3>' + ''.join(polozky) + '</section>')

podla = {p['id']: p for p in P}
G = []
G.append(skupina('Písmená a samohlásky', 'lekcie 1–11', [pol(podla[f'l{n}'], n) for n in range(1, 12)]))
G.append(skupina('Opakovanie', 'cvičebnica s. 3–5', [pol(podla['prehlad'], ''), pol(podla['s3'], '1'), pol(podla['s4'], '2'),
                                           pol(podla['s5a'], '3'), pol(podla['s5b'], '4')]))
G.append(skupina('Čítanie', '', [pol(podla['pravidla'], '')] +
                 [pol(podla[f'amida{i}'], f'{i}', sub=nb('Amida · ' + podla[f'amida{i}']['desc'])) for i in range(1, 6)]))
G.append(skupina('Cvičné čítanie', 'slová a frázy z Amidy', [pol(podla[f'cc{n}'], n) for n in range(1, 10)]))
G.append(skupina('Prehľady', '', [pol(podla['abeceda'], ''), pol(podla['samohlasky'], '')]))
OBSAH = ''.join(G)

# ---------- mriežka „Na ktorú časť?“ ----------
def chip(pid, t, w2=False, pod=''):
    return (f'<button type="button" class="chip{" w2" if w2 else ""}" data-p="{pid}">{t}' +
            (f'<small>{pod}</small>' if pod else '') + '</button>')
M = ['<div class="oz">Lekcie<span>písmená a samohlásky</span></div>'] + [chip(f'l{n}', n) for n in range(1, 12)]
M += ['<div class="oz">Opakovanie<span>cvičebnica s. 3–5</span></div>', chip('prehlad', 'Prehľad', True), chip('s3', '1', pod='s. 3'), chip('s4', '2', pod='s. 4'), chip('s5a', '3', pod='s. 5'), chip('s5b', '4', pod='s. 5')]
M += ['<div class="oz">Čítanie</div>', chip('pravidla', 'Pravidlá', True)] + [chip(f'amida{i}', f'Amida {i}', True) for i in range(1, 6)]
M += ['<div class="oz">Cvičné čítanie<span>slová a frázy z Amidy</span></div>'] + [chip(f'cc{n}', n, pod=f's. {STR_CC[n]}') for n in range(1, 10)]
M += ['<div class="oz">Prehľady</div>', chip('abeceda', 'Abeceda', True), chip('samohlasky', 'Samohlásky', True)]
MRIEZKA = ''.join(M)

META = json.dumps([{k: p[k] for k in ('id', 'grp', 'pill', 'tit', 'kr', 'desc', 'pis', 'he', 'kon', 'ser', 'num')} for p in P],
                  ensure_ascii=False)

out = open(SRC + 'sablona.html', encoding='utf-8').read()
for k, v in (('{{CSS}}', open(SRC + 'app.css', encoding='utf-8').read()), ('{{STRANY}}', ''.join(strany)),
             ('{{OBSAH}}', OBSAH), ('{{MRIEZKA}}', MRIEZKA), ('{{META}}', META),
             ('{{JS}}', open(SRC + 'app.js', encoding='utf-8').read())):
    assert k in out, k
    out = out.replace(k, v)
open('index.html', 'w', encoding='utf-8').write(out)
print('index.html:', len(out) // 1024, 'KB,', len(P), 'strán')
