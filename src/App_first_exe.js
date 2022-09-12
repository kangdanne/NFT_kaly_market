import logo from "./logo.svg";
import Caver from "caver-js";
import "./App.css";

// 1. Smart contract 배포, 주소 파악
// 2. caver.js 이용해서 smart contract 연동하기
// 3. 가져온 smart contract 실행결과(데이터) 웹이 표현하기

const COUNT_CONTRACT_ADDRESS = "0xa41A0Fceef6361974c76b235ee0DBFdf4f4ff651";
const ACCESS_KEY_ID = "엑세스키 넣기";
const SECRET_KEY = "시크릿 키 넣기";
const CHAIN_ID = "1001"; // TEST NET (Baobab) 1001, MAIN NET 8217
const COUNT_ABI =
  '[ { "constant": true, "inputs": [], "name": "count", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getBlockNumber", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]';

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

// 어디로가서?
const CountContract = new caver.contract(
  JSON.parse(COUNT_ABI),
  COUNT_CONTRACT_ADDRESS
);

// 무엇을 실행?
// smart contract의 값 불러오기
const readCount = async () => {
  const _count = await CountContract.methods.count().call();
  console.log(_count);
};

// 잔고 조회
const getBalance = (address) => {
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

const setCount = async (newCount) => {
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

function App() {
  readCount();
  getBalance("0x403e9fd0c8f9f5160d387b7a4b4940420e49bf21");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button
          title={"카운트 변경"}
          onClick={() => {
            setCount(100);
          }}
        />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
