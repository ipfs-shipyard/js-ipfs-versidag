import createIpfsVersidag from '../src';
import createInMemoryIpfs from './helpers/memory-ipfs';

it('should resolve versions correctly', async () => {
    const myVersidag = createIpfsVersidag({
        ipfs: createInMemoryIpfs(),
        tieBreaker: (node1, node2) => node1.meta - node2.meta,
    });

    const myVersidagA = await myVersidag.add('Hi', 1);
    const myVersidagB = await myVersidagA.add('Hello', 2);
    const myVersidagC = await myVersidagA.add('Hi World', 3);
    const myVersidagD = await myVersidagB.merge(myVersidagC.headCids, 'Hello World');

    const result = await myVersidagD.resolve();

    expect(result.versions).toEqual([
        { version: 'Hello World' },
        { version: 'Hi World', meta: 3 },
        { version: 'Hello', meta: 2 },
        { version: 'Hi', meta: 1 },
    ]);
});
