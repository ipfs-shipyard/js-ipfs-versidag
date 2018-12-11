import createIpfsVersidag from '../src';
import createInMemoryIpfs from './helpers/memory-ipfs';

describe('factory', () => {
    it('should return a versidag instance with readNode and writeNode configured (with heads & config)', () => {
        const versidag = createIpfsVersidag(['foo'], {
            ipfs: createInMemoryIpfs(),
            concurrency: 5,
        });

        expect(versidag.headCids).toEqual(['foo']);
        expect(typeof versidag.config.readNode).toBe('function');
        expect(typeof versidag.config.writeNode).toBe('function');
        expect(versidag.config.concurrency).toBe(5);
    });

    it('should return a versidag instance with readNode and writeNode configured (config)', () => {
        const versidag = createIpfsVersidag({ concurrency: 5 });

        expect(versidag.headCids).toEqual([]);
        expect(typeof versidag.config.readNode).toBe('function');
        expect(typeof versidag.config.writeNode).toBe('function');
        expect(versidag.config.concurrency).toBe(5);
    });
});

describe('writeNode', () => {
    it('should write the correct cbor dag node', async () => {
        const ipfs = createInMemoryIpfs();
        const versidag = createIpfsVersidag({ ipfs });

        await versidag.add('A', 1);

        expect(ipfs.dag.put).toHaveBeenCalledTimes(1);
        expect(ipfs.dag.put).toHaveBeenCalledWith({
            version: 'A',
            meta: 1,
        });
    });

    it('should write the correct cbor dag node, with parents', async () => {
        const ipfs = createInMemoryIpfs();
        const versidag = createIpfsVersidag(['A', 'B'], { ipfs });

        await versidag.add('C', 3);

        expect(ipfs.dag.put).toHaveBeenCalledTimes(1);
        expect(ipfs.dag.put).toHaveBeenCalledWith({
            parents: [
                { '/': 'A' },
                { '/': 'B' },
            ],
            version: 'C',
            meta: 3,
        });
    });

    it('should respect timeout when writing a node', async () => {
        const ipfs = createInMemoryIpfs();

        ipfs.dag.put = () => new Promise(() => {});

        const versidag = createIpfsVersidag({ ipfs, writeTimeout: 50 });
        const node = { parents: [], version: 'A', meta: 1 };

        await expect(versidag.config.writeNode(node)).rejects.toThrow('timed out');
    });
});

describe('readNode', () => {
    it('should read the correct cbor dag node', async () => {
        const ipfs = createInMemoryIpfs();
        const versidag = createIpfsVersidag({ ipfs });

        const versidagA = await versidag.add('A', 1);

        await versidagA.resolve();

        expect(ipfs.dag.get).toHaveBeenCalledTimes(1);
        expect(ipfs.dag.get).toHaveBeenCalledWith(versidagA.headCids[0]);
    });

    it('should read the correct cbor dag node, with parents', async () => {
        const ipfs = createInMemoryIpfs();
        const versidag = createIpfsVersidag({ ipfs });

        const versidagA = await versidag.add('A', 1);
        const versidagB = await versidagA.add('B', 2);

        await versidagB.resolve();

        expect(ipfs.dag.get).toHaveBeenCalledTimes(2);
        expect(ipfs.dag.get).toHaveBeenCalledWith(versidagA.headCids[0]);
        expect(ipfs.dag.get).toHaveBeenCalledWith(versidagB.headCids[0]);
    });

    it('should respect timeout when reading a node', async () => {
        const ipfs = createInMemoryIpfs();

        ipfs.dag.get = () => new Promise(() => {});

        const versidag = createIpfsVersidag(['A'], { ipfs, readTimeout: 50 });

        await expect(versidag.config.readNode('A')).rejects.toThrow('timed out');
    });
});
