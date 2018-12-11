import createVersidag from 'versidag';
import pTimeout from 'p-timeout';

const maybeTimeout = (promise, timeout) =>
    timeout != null ? pTimeout(promise, timeout) : promise;

const createReadNode = (ipfs) => async (cid, config) => {
    const result = await maybeTimeout(ipfs.dag.get(cid), config.readTimeout);

    const { parents = [], ...data } = result.value;

    return {
        parents: parents.map((cid) => cid.toBaseEncodedString()),
        ...data,
    };
};

const createWriteNode = (ipfs) => async (node, config) => {
    const { parents, ...dagNode } = node;

    if (parents.length) {
        dagNode.parents = parents.map((cid) => ({ '/': cid }));
    }

    const cid = await maybeTimeout(ipfs.dag.put(dagNode), config.writeTimeout);

    return cid.toBaseEncodedString();
};

const createIpfsVersidag = (headCids, config) => {
    // Allow heads to be optinal
    if (!Array.isArray(headCids)) {
        config = headCids;
        headCids = [];
    }

    const { ipfs, ...rest } = config;

    config = {
        ...rest,
        readNode: createReadNode(ipfs),
        writeNode: createWriteNode(ipfs),
    };

    return createVersidag(headCids, config);
};

export default createIpfsVersidag;
