"""Post-elaborazione del .docx generato da docx@9.6.1.
- rinumera gli id dei segnalibri (la libreria li crea tutti con id=1)."""
import re, sys, zipfile, shutil, os

def rinumera(xml):
    n = [0]
    def start(m):
        n[0] += 1
        return m.group(0).replace('w:id="%s"' % m.group(1), 'w:id="%d"' % n[0])
    xml = re.sub(r'<w:bookmarkStart [^>]*w:id="(\d+)"[^>]*/>', start, xml)
    k = [0]
    def end(m):
        k[0] += 1
        return '<w:bookmarkEnd w:id="%d"/>' % k[0]
    xml = re.sub(r'<w:bookmarkEnd w:id="\d+"/>', end, xml)
    assert n[0] == k[0], (n, k)
    return xml

def main(path):
    tmp = path + '.tmp'
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            data = zin.read(it.filename)
            if it.filename == 'word/document.xml':
                data = rinumera(data.decode('utf8')).encode('utf8')
            zout.writestr(it, data)
    shutil.move(tmp, path)

if __name__ == '__main__':
    main(sys.argv[1])
