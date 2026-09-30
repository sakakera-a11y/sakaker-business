from pathlib import Path
import sys
page=Path(sys.argv[1] if len(sys.argv)>1 else 'index.html')
text=page.read_text(encoding='utf-8')
if 'id="sakaker-chess-launcher-js"' not in text:
    if '<html' not in text.lower() or '</html>' not in text.lower():
        raise SystemExit('Refusing to patch incomplete index.html')
    asset=Path('.github/assets/chess-launcher.html').read_text(encoding='utf-8')
    page.write_text(text.rstrip()+'\n\n'+asset,encoding='utf-8')
