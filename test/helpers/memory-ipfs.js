import objHash from 'object-hash';

const createMemoryIpfs = () => {
    const nodesMap = new Map();

    return {
        dag: {
            get: jest.fn((cid) => {
                const dagNode = { ...nodesMap.get(cid) };

                if (dagNode.parents) {
                    dagNode.parents = dagNode.parents.map((link) => ({
                        toBaseEncodedString: () => link['/'],
                    }));
                }

                return Promise.resolve({ value: dagNode });
            }),
            put: jest.fn((dagNode) => {
                const cid = objHash(dagNode);

                nodesMap.set(cid, dagNode);

                return Promise.resolve({
                    toBaseEncodedString: () => cid,
                });
            }),
        },
    };
};

export default createMemoryIpfs;
