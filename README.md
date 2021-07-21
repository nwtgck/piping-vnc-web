# Piping VNC
VNC over pure HTTPS via [Piping Server](https://github.com/nwtgck/piping-server)

## Application
<https://piping-vnc.nwtgck.org>

## Requirements

This project requires the latest Google Chrome with enable-experimental-web-platform-features flag for [fetch() upload streaming](https://www.chromestatus.com/feature/5274139738767360) feature (origin trial now).

chrome://flags/ > Experimental Web Platform features > Enabled

## Acknowledgements
This project is highly based on [noVNC]. Thanks to the original authors!

## Features
* Transfer data over pure HTTP/HTTPS
* End-to-end encryption using the same way as OpenSSL AES CTR does

### Features powered by [noVNC]

* Supported VNC encodings: raw, copyrect, rre, hextile, tight, tightPNG
* Supports scaling, clipping and resizing the desktop
* Local cursor rendering
* Clipboard copy/paste
* Translations
* Touch gestures for emulating common mouse actions
* Licensed mainly under the [MPL 2.0](http://www.mozilla.org/MPL/2.0/), see
  [the license document](LICENSE.txt) for details

## URL fragment parameters

e.g. <https://piping-vnc.nwtgck.org/vnc.html#?cs_path=aaa&sc_path=bbb>.  
Use `#?`, which does not send parameters to the hosting server: piping-vnc.nwtgck.org.

* `server`: Piping Server URL
* `cs_path`: Server-to-client path
* `sc_path`: Client-to-server path
* `headers`: HTTP headers to Piping Server
  - (e.g. `[["X-MyExtra1", "myvalue1"], ["Content-Type", "application/myapp"]]`)

## Run locally

```bash
cd <this repo>
git submodule update --init --recursive # (once)
npm ci # (once)
npm run build-openssl-aes-ctr-stream # (once)
python3 -m http.server
```

Then, open <http://localhost:8000>.

## Server Requirements

noVNC follows the standard VNC protocol, but unlike other VNC clients it does
require WebSockets support. Many servers include support (e.g.
[x11vnc/libvncserver](http://libvncserver.sourceforge.net/),
[QEMU](http://www.qemu.org/), and
[MobileVNC](http://www.smartlab.at/mobilevnc/)), but for the others you need to
use a WebSockets to TCP socket proxy.

## Authors/Contributors of [noVNC]

See [AUTHORS](AUTHORS) for a (full-ish) list of authors.

* Core team:
    * [Joel Martin](https://github.com/kanaka)
    * [Samuel Mannehed](https://github.com/samhed) (Cendio)
    * [Solly Ross](https://github.com/DirectXMan12) (Red Hat / OpenStack)
    * [Pierre Ossman](https://github.com/CendioOssman) (Cendio)

* Notable contributions:
    * UI and Icons : Pierre Ossman, Chris Gordon
    * Original Logo : Michael Sersen
    * tight encoding : Michael Tinglof (Mercuri.ca)

* Included libraries:
    * base64 : Martijn Pieters (Digital Creations 2), Samuel Sieb (sieb.net)
    * DES : Dave Zimmerman (Widget Workshop), Jef Poskanzer (ACME Labs)
    * Pako : Vitaly Puzrin (https://github.com/nodeca/pako)

[noVNC]: https://github.com/novnc/noVNC
