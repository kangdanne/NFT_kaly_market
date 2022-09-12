import Caver from "caver-js";
//import CounterABI from "../abi/CounterABI.json";
import KIP17ABI from "../abi/KIP17TokenABI.json";

import {
  COUNT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  MARKET_CONTRACT_ADDRESS,
  ACCESS_KEY_ID,
  SECRET_KEY,
  CHAIN_ID,
} from "../constants";

const option = {
  // Kas API를 호출할 떄 필요한 파라미터, 인증이 되야 API사용할 수 있음
  headers: [
    {
      name: "Authorization",
      value:
        "Basic " +
        Buffer.from(ACCESS_KEY_ID + ":" + SECRET_KEY).toString("base64"),
    },
    { name: "x-chain-id", value: CHAIN_ID }, // 테스트넷이냐, 메인넷이냐
  ],
};

// 누구한테 실행할지?
const caver = new Caver(
  new Caver.providers.HttpProvider(
    "https://node-api.klaytnapi.com/v1/klaytn",
    option
  )
);

const NFTContract = new caver.contract(KIP17ABI, NFT_CONTRACT_ADDRESS);

export const fetchCardsOf = async (address) => {
  // Fetch Balance : NFT카드 수
  const balance = await NFTContract.methods.balanceOf(address).call();
  console.log(`[NFT Balance] ${balance}`);

  // Fetch Token IDs
  const tokenIds = [];

  for (let i = 0; i < balance; i++) {
    const id = await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
    tokenIds.push(id);
  }
  // Fetch Token URIs
  const tokenUris = [];
  for (let i = 0; i < balance; i++) {
    const uri = await NFTContract.methods.tokenURI(tokenIds[i]).call();
    tokenUris.push(uri);
  }
  console.log(`${tokenIds}`);
  console.log(`${tokenUris[0]}`);
  console.log(`${tokenUris[1]}`);

  const nfts = [];
  for (let i = 0; i < balance; i++) {
    nfts.push({ uri: tokenUris[i], id: tokenIds[i] });
  }
  console.log(nfts);
  return nfts;
};

// 잔고 조회
export const getBalance = (address) => {
  // 특정 주소에 대한 잔고를 받아주세요.
  return caver.rpc.klay.getBalance(address).then((response) => {
    // 답변이 오면 우리가 읽을 수 있는 klay 단위로 변경해주세요. (convertFromPeb)
    const balance = caver.utils.convertFromPeb(
      caver.utils.hexToNumberString(response)
    );
    console.log(`BALANCE: ${balance}`);
    return balance;
  });
};

// 어디로가서?
// const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS)
/*
// 무엇을 실행?
// smart contract의 값 불러오기
export const readCount = async () => {
  const _count = await CountContract.methods.count().call();
  console.log(_count);
};

export const setCount = async (newCount) => {
  // 사용할 account 설정
  try {
    // privatekey는 노출시키면 안됨. 유저한테 입력하게 하는 것도 좀...그렇다.
    const privatekey = "프라이빗 키 넣기";
    const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
    caver.wallet.add(deployer);

    // 스마트 컨트렉트 실행 트랜젝션 날리기
    const receipt = await CountContract.methods.setCount(newCount).send({
      from: deployer.address, //address
      gas: "0x4bfd200", // 수수료는 아무 숫자나 넣어도 필요한 만큼만 사용하고 돌아옴
    });

    // 결과 확인
    console.log(receipt);
  } catch (e) {
    console.log(`[ERROR_SET_COUNT] ${e}`);
  }
};
*/
