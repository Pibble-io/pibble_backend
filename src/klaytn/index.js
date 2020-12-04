import Caver from 'caver-js';

const {
    KLAY_NODE_URL: nodeUrl
} = process.env;

// connect ken node
var caver = new Caver(nodeUrl);

caver.klay.net.getId().then(id => {
    console.log('Klaytn Network ID is ', id);
});

export default caver;