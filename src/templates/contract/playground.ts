import { Blockchain } from "@proton/vert";

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const blockchain = new Blockchain();
  const playContract = blockchain.createContract('play', 'target/<%= contractName %>.contract');
  await wait(0);
  // Put you actions calls here
}

main()
