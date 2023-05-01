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

<<<<<<< HEAD
* Supported VNC encodings: raw, copyrect, rre, hextile, tight, tightPNG
=======
The project website is found at [novnc.com](http://novnc.com).
Notable commits, announcements and news are posted to
[@noVNC](http://www.twitter.com/noVNC).

If you are a noVNC developer/integrator/user (or want to be) please join the
[noVNC discussion group](https://groups.google.com/forum/?fromgroups#!forum/novnc).

Bugs and feature requests can be submitted via
[github issues](https://github.com/novnc/noVNC/issues). If you have questions
about using noVNC then please first use the
[discussion group](https://groups.google.com/forum/?fromgroups#!forum/novnc).
We also have a [wiki](https://github.com/novnc/noVNC/wiki/) with lots of
helpful information.

If you are looking for a place to start contributing to noVNC, a good place to
start would be the issues that are marked as
["patchwelcome"](https://github.com/novnc/noVNC/issues?labels=patchwelcome).
Please check our
[contribution guide](https://github.com/novnc/noVNC/wiki/Contributing) though.

If you want to show appreciation for noVNC you could donate to a great non-
profits such as:
[Compassion International](http://www.compassion.com/),
[SIL](http://www.sil.org),
[Habitat for Humanity](http://www.habitat.org),
[Electronic Frontier Foundation](https://www.eff.org/),
[Against Malaria Foundation](http://www.againstmalaria.com/),
[Nothing But Nets](http://www.nothingbutnets.net/), etc.
Please tweet [@noVNC](http://www.twitter.com/noVNC) if you do.


### Features

* Supports all modern browsers including mobile (iOS, Android)
* Supported authentication methods: none, classical VNC, RealVNC's
  RSA-AES, Tight, VeNCrypt Plain, XVP, Apple's Diffie-Hellman,
  UltraVNC's MSLogonII
* Supported VNC encodings: raw, copyrect, rre, hextile, tight, tightPNG,
  ZRLE, JPEG
>>>>>>> 90455eef0692d2e35276fd31286114d0955016b0
* Supports scaling, clipping and resizing the desktop
* Local cursor rendering
* Clipboard copy/paste with full Unicode support
* Translations
* Touch gestures for emulating common mouse actions
* Licensed mainly under the [MPL 2.0](http://www.mozilla.org/MPL/2.0/), see
  [the license document](LICENSE.txt) for details

## URL fragment parameters

e.g. <https://piping-vnc.nwtgck.org/vnc.html#?cs_path=aaa&sc_path=bbb>.  
Use `#?`, which does not send parameters to the hosting server: piping-vnc.nwtgck.org.

* `password`: VNC password
* `server`: Piping Server URL
* `cs_path`: Server-to-client path
* `sc_path`: Client-to-server path
* `vnc_server_port`: VNC server port for command hint
* `headers`: HTTP headers to Piping Server
  - (e.g. `[["X-MyExtra1", "myvalue1"], ["Content-Type", "application/myapp"]]`)
* `e2ee`: E2E encryption option
  - (type: `{ "cipher_type": "openssl-aes-256-ctr", "pass": string, "pbkdf2": { "iter": number, "hash": "sha1" | "sha256" | "sha512" } }`)

## Run locally

```bash
cd <this repo>
git submodule update --init --recursive # (once)
npm ci # (once)
npm run build-openssl-aes-ctr-stream # (once)
python3 -m http.server
```

Then, open <http://localhost:8000>.

<<<<<<< HEAD
## Server Requirements
=======
noVNC uses many modern web technologies so a formal requirement list is
not available. However these are the minimum versions we are currently
aware of:

* Chrome 64, Firefox 79, Safari 13.4, Opera 51, Edge 79


### Server Requirements
>>>>>>> 90455eef0692d2e35276fd31286114d0955016b0

noVNC follows the standard VNC protocol, but unlike other VNC clients it does
require WebSockets support. Many servers include support (e.g.
[x11vnc/libvncserver](http://libvncserver.sourceforge.net/),
[QEMU](http://www.qemu.org/), and
[MobileVNC](http://www.smartlab.at/mobilevnc/)), but for the others you need to
use a WebSockets to TCP socket proxy.

## Authors/Contributors of [noVNC]

<<<<<<< HEAD
See [AUTHORS](AUTHORS) for a (full-ish) list of authors.
=======
### Quick Start

* Use the `novnc_proxy` script to automatically download and start websockify, which
  includes a mini-webserver and the WebSockets proxy. The `--vnc` option is
  used to specify the location of a running VNC server:

    `./utils/novnc_proxy --vnc localhost:5901`
    
* If you don't need to expose the web server to public internet, you can
  bind to localhost:
  
    `./utils/novnc_proxy --vnc localhost:5901 --listen localhost:6081`

* Point your browser to the cut-and-paste URL that is output by the `novnc_proxy`
  script. Hit the Connect button, enter a password if the VNC server has one
  configured, and enjoy!

### Installation from Snap Package
Running the command below will install the latest release of noVNC from Snap:

`sudo snap install novnc`

#### Running noVNC from Snap Directly

You can run the Snap-package installed novnc directly with, for example:

`novnc --listen 6081 --vnc localhost:5901 # /snap/bin/novnc if /snap/bin is not in your PATH`

If you want to use certificate files, due to standard Snap confinement restrictions you need to have them in the /home/\<user\>/snap/novnc/current/ directory. If your username is jsmith an example command would be:
  
  `novnc --listen 8443 --cert ~jsmith/snap/novnc/current/self.crt --key ~jsmith/snap/novnc/current/self.key --vnc ubuntu.example.com:5901`

#### Running noVNC from Snap as a Service (Daemon)
The Snap package also has the capability to run a 'novnc' service which can be 
configured to listen on multiple ports connecting to multiple VNC servers 
(effectively a service runing multiple instances of novnc).
Instructions (with example values):

List current services (out-of-box this will be blank):

```
sudo snap get novnc services
Key             Value
services.n6080  {...}
services.n6081  {...}
```

Create a new service that listens on port 6082 and connects to the VNC server 
running on port 5902 on localhost:

`sudo snap set novnc services.n6082.listen=6082 services.n6082.vnc=localhost:5902`

(Any services you define with 'snap set' will be automatically started)
Note that the name of the service, 'n6082' in this example, can be anything 
as long as it doesn't start with a number or contain spaces/special characters.

View the configuration of the service just created:

```
sudo snap get novnc services.n6082
Key                    Value
services.n6082.listen  6082
services.n6082.vnc     localhost:5902
```

Disable a service (note that because of a limitation in  Snap it's currently not 
possible to unset config variables, setting them to blank values is the way 
to disable a service):

`sudo snap set novnc services.n6082.listen='' services.n6082.vnc=''`

(Any services you set to blank with 'snap set' like this will be automatically stopped)

Verify that the service is disabled (blank values):

```
sudo snap get novnc services.n6082
Key                    Value
services.n6082.listen  
services.n6082.vnc
```

### Integration and Deployment

Please see our other documents for how to integrate noVNC in your own software,
or deploying the noVNC application in production environments:

* [Embedding](docs/EMBEDDING.md) - For the noVNC application
* [Library](docs/LIBRARY.md) - For the noVNC JavaScript library


### Authors/Contributors

See [AUTHORS](AUTHORS) for a (full-ish) list of authors.  If you're not on
that list and you think you should be, feel free to send a PR to fix that.
>>>>>>> 90455eef0692d2e35276fd31286114d0955016b0

* Core team:
    * [Samuel Mannehed](https://github.com/samhed) (Cendio)
    * [Pierre Ossman](https://github.com/CendioOssman) (Cendio)

* Previous core contributors:
    * [Joel Martin](https://github.com/kanaka) (Project founder)
    * [Solly Ross](https://github.com/DirectXMan12) (Red Hat / OpenStack)

* Notable contributions:
    * UI and Icons : Pierre Ossman, Chris Gordon
    * Original Logo : Michael Sersen
    * tight encoding : Michael Tinglof (Mercuri.ca)
    * RealVNC RSA AES authentication : USTC Vlab Team

* Included libraries:
    * base64 : Martijn Pieters (Digital Creations 2), Samuel Sieb (sieb.net)
    * DES : Dave Zimmerman (Widget Workshop), Jef Poskanzer (ACME Labs)
    * Pako : Vitaly Puzrin (https://github.com/nodeca/pako)

[noVNC]: https://github.com/novnc/noVNC
