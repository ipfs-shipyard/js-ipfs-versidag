# ipfs-versidag

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/ipfs-versidag
[downloads-image]:http://img.shields.io/npm/dm/ipfs-versidag.svg
[npm-image]:http://img.shields.io/npm/v/ipfs-versidag.svg
[travis-url]:https://travis-ci.org/ipfs-shipyard/js-ipfs-versidag
[travis-image]:http://img.shields.io/travis/ipfs-shipyard/js-ipfs-versidag/master.svg
[codecov-url]:https://codecov.io/gh/ipfs-shipyard/js-ipfs-versidag
[codecov-image]:https://img.shields.io/codecov/c/github/ipfs-shipyard/js-ipfs-versidag/master.svg
[david-dm-url]:https://david-dm.org/ipfs-shipyard/js-ipfs-versidag
[david-dm-image]:https://img.shields.io/david/ipfs-shipyard/js-ipfs-versidag.svg
[david-dm-dev-url]:https://david-dm.org/ipfs-shipyard/js-ipfs-versidag?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/ipfs-shipyard/js-ipfs-versidag.svg

> Concurrent version history based on a Merkle-DAG on top of IPFS and IPLD.

This module wraps [versidag](https://github.com/ipfs-shipyard/js-versidag) and automatically configures `readNode` and `writeNode` to use [IPFS](https://ipfs.io/) and [IPLD](https://ipld.io/).

**version + dag = versidag**


## Installation

```sh
$ npm install ipfs-versidag
```

You must also install `ipfs` as it is a peer dependency of this module.


## Usage

```js
import IPFS from 'ipfs';
import createIpfsVersidag from 'ipfs-versidag';

const ipfs = new IPFS();

ipfs.on('ready', async () => {
    const myVersidag = createIpfsVersidag({
        ipfs,
        tieBreaker: (node1, node2) => /* */,
    });

    const myVersidagA = await myVersidag.add('Hi', 1);
    const myVersidagB = await myVersidagA.add('Hello', 2);
    const myVersidagC = await myVersidagA.add('Hi World', 3);
    const myVersidagD = await myVersidagB.merge(myVersidagC.headCids, 'Hello World');

    const versions = await myVersidagD.resolve();
    // [
    //   { version: 'Hello World' },
    //   { version: 'Hi World', meta: 3 }
    //   { version: 'Hello', meta: 2 }
    //   { version: 'Hi', meta: 1 }
    // ]
});
```

You may use the [IPLD explorer](https://explore.ipld.io/) to inspect the Merkle DAG.


## API

Please refer to the [versidag API](https://github.com/ipfs-shipyard/js-versidag).


## Tests

```sh
$ npm test
$ npm test -- --watch  # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
