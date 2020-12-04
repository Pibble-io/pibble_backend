import contracts from './contracts';
import web3 from './index';

const {
  MAIN_ACCOUNT: mainAccount,
  MAIN_ACCOUNT_PASSWORD: mainAccountPassword
} = process.env;

export async function transferEther(privateKey, recipientAddress, value) {

  let senderAccount = web3.eth.accounts.wallet.add(privateKey);

  let weiValue = web3.utils.toWei(String(value), "ether");

  //get the estimation of gas
  const gasLimit = await web3.eth.estimateGas({
    from: senderAccount.address,
    to: recipientAddress,
    value: weiValue
  });
  //get the current gas price (wei)
  const gasPrice = await web3.eth.getGasPrice();

  const txHash = await new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      from: senderAccount.address,
      to: recipientAddress,
      value: weiValue,
      gas: gasLimit,
      gasPrice: gasPrice
    })
      .on('transactionHash', resolve)
      .on('receipt', receipt => {
        // console.log("receipt: ", receipt);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        // console.log("confirmation", receipt);
      })
      .on('error', error => {
        reject(error);
      }); // If a out of gas error, the second parameter is the receipt.
  });

  web3.eth.accounts.wallet.remove(senderAccount.index);

  return txHash;
}

export async function depositEther(privateKey) {

  let senderAccount = web3.eth.accounts.wallet.add(privateKey);

  const weiValue = web3.utils.toBN(await getETHBalance(senderAccount.address));

  //get the estimation of gas
  const gasLimit = parseInt(await web3.eth.estimateGas({
    from: senderAccount.address,
    to: mainAccount,
    value: weiValue
  }));
  //get the current gas price (wei)
  const gasPrice = parseInt(await web3.eth.getGasPrice());

  const gas = web3.utils.toBN(gasLimit * gasPrice);

  const txHash = await new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      from: senderAccount.address,
      to: mainAccount,
      value: weiValue.sub(gas),
      gas: gasLimit,
      gasPrice: gasPrice
    })
      .on('transactionHash', resolve)
      .on('receipt', receipt => {
        // console.log("receipt: ", receipt);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        // console.log("confirmation", receipt);
      })
      .on('error', error => {
        reject(error);
      }) // If a out of gas error, the second parameter is the receipt.
      .catch(ex => {
        console.error(ex);
      })
  });

  web3.eth.accounts.wallet.remove(senderAccount.index);

  return txHash;
}

export async function withdrawEther(recipientAddress, value) {

  await web3.eth.personal.unlockAccount(mainAccount, mainAccountPassword, null);

  let weiValue = web3.utils.toWei(String(value), "ether");

  //get the estimation of gas
  const gasLimit = await web3.eth.estimateGas({
    from: mainAccount,
    to: recipientAddress,
    value: weiValue
  });
  //get the current gas price (wei)
  const gasPrice = await web3.eth.getGasPrice();

  const txHash = await new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      from: mainAccount,
      to: recipientAddress,
      value: weiValue,
      gas: gasLimit,
      gasPrice: gasPrice
    })
      .on('transactionHash', resolve)
      .on('receipt', receipt => {
        // console.log("receipt: ", receipt);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        // console.log("confirmation", receipt);
      })
      .on('error', error => {
        reject(error);
      }); // If a out of gas error, the second parameter is the receipt.
  });

  return txHash;
}

export async function transferToken(privateKey, recipientAddress, value) {

  let senderAccount = web3.eth.accounts.wallet.add(privateKey);

  let weiValue = web3.utils.toWei(String(value), "ether");

  //get the estimation of gas
  const gasLimit = await contracts.pibbleToken.methods.transfer(recipientAddress, weiValue).estimateGas({
    from: senderAccount.address
  });
  //get the current gas price (wei)
  const gasPrice = await web3.eth.getGasPrice();

  const txHash = await new Promise((resolve, reject) => {
    contracts.pibbleToken.methods.transfer(recipientAddress, weiValue)
      .send({
        from: senderAccount.address,
        to: contracts.pibbleToken.options.address,
        value: 0,
        gas: gasLimit,
        gasPrice: gasPrice
      })
      .on('transactionHash', resolve)
      .on('receipt', function (receipt) {
        // console.log("receipt: ", receipt);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        // console.log("confirmation", receipt);
      })
      .on('error', reject); // If a out of gas error, the second parameter is the receipt.
  });

  web3.eth.accounts.wallet.remove(senderAccount.index);

  return txHash;
}

export async function depositPIBToken(privateKey) {
  let senderAccount = web3.eth.accounts.wallet.add(privateKey);

  const weiValue = await getPIBBalance(senderAccount.address);

  //get the estimation of gas
  const gasLimit = parseInt(await contracts.pibbleToken.methods.transfer(mainAccount, weiValue).estimateGas({
    from: senderAccount.address
  }));
  //get the current gas price (wei)
  const gasPrice = parseInt(await web3.eth.getGasPrice());

  const gas = gasLimit * gasPrice;

  await web3.eth.personal.unlockAccount(mainAccount, mainAccountPassword, null);

  web3.eth.sendTransaction({
    from: mainAccount,
    to: senderAccount.address,
    value: gas,
    gas: 21000,
    gasPrice: gasPrice
  })
    .then(receipt => {
      console.info('Fill Gas for deposit PIB Tx: ', receipt.transactionHash);
      if (receipt.status) {
        return contracts.pibbleToken.methods.transfer(mainAccount, weiValue)
          .send({
            from: senderAccount.address,
            to: contracts.pibbleToken.options.address,
            value: 0,
            gas: gasLimit,
            gasPrice: gasPrice
          })
      }

      reject("Error: Send Ether Transaction was reverted");
    })
    .then(receipt => {
      console.info('Deposit PIB Tx: ', receipt.transactionHash);
    })
    .catch(error => {
      console.error(error);
    })
    .finally(() => {
      web3.eth.accounts.wallet.remove(senderAccount.index);
    });
}

export async function withdrawToken(recipientAddress, value) {

  await web3.eth.personal.unlockAccount(mainAccount, mainAccountPassword, null);

  let weiValue = web3.utils.toWei(String(value), "ether");

  //get the estimation of gas
  const gasLimit = await contracts.pibbleToken.methods.transfer(recipientAddress, weiValue).estimateGas({
    from: mainAccount
  });
  //get the current gas price (wei)
  const gasPrice = await web3.eth.getGasPrice();

  const txHash = await new Promise((resolve, reject) => {
    contracts.pibbleToken.methods.transfer(recipientAddress, weiValue)
      .send({
        from: mainAccount,
        to: contracts.pibbleToken.options.address,
        value: 0,
        gas: gasLimit,
        gasPrice: gasPrice
      })
      .on('transactionHash', resolve)
      .on('receipt', function (receipt) {
        // console.log("receipt: ", receipt);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        // console.log("confirmation", receipt);
      })
      .on('error', reject); // If a out of gas error, the second parameter is the receipt.
  });

  return txHash;
}

export async function transferTokenTxFee(address) {

  //get the estimation of gas
  const gasLimit = parseInt(await contracts.pibbleToken.methods.transfer(address, 0).estimateGas({
    from: mainAccount
  }));
  //get the current gas price (wei)
  const gasPrice = parseInt(await web3.eth.getGasPrice());

  const gas = gasLimit * gasPrice;

  await web3.eth.personal.unlockAccount(mainAccount, mainAccountPassword, null);

  const txHash = await new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      from: mainAccount,
      to: address,
      value: gas,
      gas: 21000,
      gasPrice: gasPrice
    })
      .on('transactionHash', resolve)
      .on('receipt', function (receipt) {
        console.info('Fill Gas for deposit PIB Tx for Samsung wallet : ', receipt.transactionHash);
      })
      .on('error', reject); // If a out of gas error, the second parameter is the receipt.
  });

  return txHash;
}

export async function getETHBalance(address) {
  return await web3.eth.getBalance(address);
}

export async function getPIBBalance(address) {
  return await contracts.pibbleToken.methods.balanceOf(address).call();
}