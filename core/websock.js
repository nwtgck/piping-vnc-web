/*
 * Websock: high-performance binary WebSockets
 * Copyright (C) 2019 The noVNC Authors
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * Websock is similar to the standard WebSocket object but with extra
 * buffer handling.
 *
 * Websock has built-in receive queue buffering; the message event
 * does not contain actual data but is simply a notification that
 * there is new data available. Several rQ* methods are available to
 * read binary data off of the receive queue.
 */

import * as Log from './util/logging.js';

const opensslAesCtrStream = window.opensslAesCtrStream;

// this has performance issues in some versions Chromium, and
// doesn't gain a tremendous amount of performance increase in Firefox
// at the moment.  It may be valuable to turn it on in the future.
// Also copyWithin() for TypedArrays is not supported in IE 11 or
// Safari 13 (at the moment we want to support Safari 11).
const ENABLE_COPYWITHIN = false;
const MAX_RQ_GROW_SIZE = 40 * 1024 * 1024;  // 40 MiB

export default class Websock {
    /**
     * @param opensslAesCtrDecryptPbkdf2Options can be undefined
     */
    constructor(opensslAesCtrDecryptPbkdf2Options) {
        // TODO: remove _websocket
        this._websocket = null;  // WebSocket object
        this._readableStreamController = null;
        this._isOpen = false;
        this._abortController = new AbortController();
        this._opensslAesCtrDecryptPbkdf2Options = opensslAesCtrDecryptPbkdf2Options;

        this._rQi = 0;           // Receive queue index
        this._rQlen = 0;         // Next write position in the receive queue
        this._rQbufferSize = 1024 * 1024 * 4; // Receive queue buffer size (4 MiB)
        // called in init: this._rQ = new Uint8Array(this._rQbufferSize);
        this._rQ = null; // Receive queue

        this._sQbufferSize = 1024 * 10;  // 10 KiB
        // called in init: this._sQ = new Uint8Array(this._sQbufferSize);
        this._sQlen = 0;
        this._sQ = null;  // Send queue

        this._eventHandlers = {
            message: () => {},
            open: () => {},
            close: () => {},
            error: () => {}
        };
    }

    // Getters and Setters
    get sQ() {
        return this._sQ;
    }

    get rQ() {
        return this._rQ;
    }

    get rQi() {
        return this._rQi;
    }

    set rQi(val) {
        this._rQi = val;
    }

    // Receive Queue
    get rQlen() {
        return this._rQlen - this._rQi;
    }

    rQpeek8() {
        return this._rQ[this._rQi];
    }

    rQskipBytes(bytes) {
        this._rQi += bytes;
    }

    rQshift8() {
        return this._rQshift(1);
    }

    rQshift16() {
        return this._rQshift(2);
    }

    rQshift32() {
        return this._rQshift(4);
    }

    // TODO(directxman12): test performance with these vs a DataView
    _rQshift(bytes) {
        let res = 0;
        for (let byte = bytes - 1; byte >= 0; byte--) {
            res += this._rQ[this._rQi++] << (byte * 8);
        }
        return res;
    }

    rQshiftStr(len) {
        if (typeof(len) === 'undefined') { len = this.rQlen; }
        let str = "";
        // Handle large arrays in steps to avoid long strings on the stack
        for (let i = 0; i < len; i += 4096) {
            let part = this.rQshiftBytes(Math.min(4096, len - i));
            str += String.fromCharCode.apply(null, part);
        }
        return str;
    }

    rQshiftBytes(len) {
        if (typeof(len) === 'undefined') { len = this.rQlen; }
        this._rQi += len;
        return new Uint8Array(this._rQ.buffer, this._rQi - len, len);
    }

    rQshiftTo(target, len) {
        if (len === undefined) { len = this.rQlen; }
        // TODO: make this just use set with views when using a ArrayBuffer to store the rQ
        target.set(new Uint8Array(this._rQ.buffer, this._rQi, len));
        this._rQi += len;
    }

    rQslice(start, end = this.rQlen) {
        return new Uint8Array(this._rQ.buffer, this._rQi + start, end - start);
    }

    // Check to see if we must wait for 'num' bytes (default to FBU.bytes)
    // to be available in the receive queue. Return true if we need to
    // wait (and possibly print a debug message), otherwise false.
    rQwait(msg, num, goback) {
        if (this.rQlen < num) {
            if (goback) {
                if (this._rQi < goback) {
                    throw new Error("rQwait cannot backup " + goback + " bytes");
                }
                this._rQi -= goback;
            }
            return true; // true means need more data
        }
        return false;
    }

    // Send Queue

    flush() {
        if (this._sQlen > 0 && this._isOpen) {
            // Wrapping Uint8Array for shallow coping
            const message = new Uint8Array(this._encodeMessage());
            this._readableStreamController.enqueue(message);
            this._sQlen = 0;
        }
    }

    send(arr) {
        this._sQ.set(arr, this._sQlen);
        this._sQlen += arr.length;
        this.flush();
    }

    sendString(str) {
        this.send(str.split('').map(chr => chr.charCodeAt(0)));
    }

    // Event Handlers
    off(evt) {
        this._eventHandlers[evt] = () => {};
    }

    on(evt, handler) {
        this._eventHandlers[evt] = handler;
    }

    _allocateBuffers() {
        this._rQ = new Uint8Array(this._rQbufferSize);
        this._sQ = new Uint8Array(this._sQbufferSize);
    }

    init() {
        this._allocateBuffers();
        this._rQi = 0;
        this._websocket = null;
    }

    open(urls, protocols) {
        this.init();

        const self = this;
        let uploadReadableStream = new ReadableStream({
            start(ctrl) {
                self._readableStreamController = ctrl;
            }
        });
        if (this._opensslAesCtrDecryptPbkdf2Options !== undefined) {
            uploadReadableStream = opensslAesCtrStream.aesCtrEncryptWithPbkdf2(uploadReadableStream, this._opensslAesCtrDecryptPbkdf2Options);
        }
        fetch(urls.clientToServerUrl, {
            method: "POST",
            body: uploadReadableStream,
            allowHTTP1ForStreamingUpload: true,
            signal: this._abortController.signal,
        });
        (async () => {
            const getResPromise = fetch(urls.serverToClientUrl, {
                signal: this._abortController.signal,
            });
            const getRes = await getResPromise;
            this._isOpen = true;
            Log.Debug('>> Open');
            this._eventHandlers.open();

            let downloadReadableStream = getRes.body;
            if (this._opensslAesCtrDecryptPbkdf2Options !== undefined) {
                downloadReadableStream = opensslAesCtrStream.aesCtrDecryptWithPbkdf2(downloadReadableStream, this._opensslAesCtrDecryptPbkdf2Options);
            }
            const reader = downloadReadableStream.getReader();
            reader.closed.then(() => {
                Log.Debug(">> Closed");
            });
            while (true) {
                const {value, done} = await reader.read();
                if (done) break;
                this._recvMessage(value);
            }
        })();
    }

    close() {
        if (this._abortController.signal) {
            Log.Info("Closing HTTPS connection over Piping Server");
            this._abortController.abort();
        }
    }

    // private methods
    _encodeMessage() {
        // Put in a binary arraybuffer
        // according to the spec, you can send ArrayBufferViews with the send method
        return new Uint8Array(this._sQ.buffer, 0, this._sQlen);
    }

    // We want to move all the unread data to the start of the queue,
    // e.g. compacting.
    // The function also expands the receive que if needed, and for
    // performance reasons we combine these two actions to avoid
    // unnecessary copying.
    _expandCompactRQ(minFit) {
        // if we're using less than 1/8th of the buffer even with the incoming bytes, compact in place
        // instead of resizing
        const requiredBufferSize =  (this._rQlen - this._rQi + minFit) * 8;
        const resizeNeeded = this._rQbufferSize < requiredBufferSize;

        if (resizeNeeded) {
            // Make sure we always *at least* double the buffer size, and have at least space for 8x
            // the current amount of data
            this._rQbufferSize = Math.max(this._rQbufferSize * 2, requiredBufferSize);
        }

        // we don't want to grow unboundedly
        if (this._rQbufferSize > MAX_RQ_GROW_SIZE) {
            this._rQbufferSize = MAX_RQ_GROW_SIZE;
            if (this._rQbufferSize - this.rQlen < minFit) {
                throw new Error("Receive Queue buffer exceeded " + MAX_RQ_GROW_SIZE + " bytes, and the new message could not fit");
            }
        }

        if (resizeNeeded) {
            const oldRQbuffer = this._rQ.buffer;
            this._rQ = new Uint8Array(this._rQbufferSize);
            this._rQ.set(new Uint8Array(oldRQbuffer, this._rQi, this._rQlen - this._rQi));
        } else {
            if (ENABLE_COPYWITHIN) {
                this._rQ.copyWithin(0, this._rQi, this._rQlen);
            } else {
                this._rQ.set(new Uint8Array(this._rQ.buffer, this._rQi, this._rQlen - this._rQi));
            }
        }

        this._rQlen = this._rQlen - this._rQi;
        this._rQi = 0;
    }

    // push arraybuffer values onto the end of the receive que
    _DecodeMessage(u8) {
        if (u8.length > this._rQbufferSize - this._rQlen) {
            this._expandCompactRQ(u8.length);
        }
        this._rQ.set(u8, this._rQlen);
        this._rQlen += u8.length;
    }

    _recvMessage(u8) {
        this._DecodeMessage(u8);
        if (this.rQlen > 0) {
            this._eventHandlers.message();
            if (this._rQlen == this._rQi) {
                // All data has now been processed, this means we
                // can reset the receive queue.
                this._rQlen = 0;
                this._rQi = 0;
            }
        } else {
            Log.Debug("Ignoring empty message");
        }
    }
}
