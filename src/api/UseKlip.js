import axios from "axios";
import {
  COUNT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  MARKET_CONTRACT_ADDRESS,
} from "../constants";

const A2P_API_PREPARE_URL = "https://a2a-api.klipwallet.com/v2/a2a/prepare";
const APP_NAME = "KLAY_MARKET";
const isMobile = window.screen.width >= 1280 ? false : true;

const getKlipAccessUrl = (method, request_key) => {
  if (method === "QR") {
    return `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
  }
  // PC가 아닌 경우 앱으로 연결
  return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
};

// 구매
export const buyCard = async (tokenId, setQrvalue, callback) => {
  const functionJson =
    ' { "constant": false, "inputs": [ { "name": "tokenId", "type": "uint256" }, { "name": "NFTAddress", "type": "address" } ], "name": "buyNFT", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }';
  excuteContract(
    MARKET_CONTRACT_ADDRESS,
    functionJson,
    "10000000000000000", // 내가 팔 금액 (16진수 0.01klay)
    `[\"${tokenId}\", \"${NFT_CONTRACT_ADDRESS}\"]`,
    setQrvalue,
    callback
  );
};

// 판매 - 무조건 Market으로 보낼 거라서 to는 필요 없음
export const listingCard = async (
  fromAddress,
  tokenId,
  setQrvalue,
  callback
) => {
  const functionJson =
    '{ "constant": false, "inputs": [ { "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
  excuteContract(
    NFT_CONTRACT_ADDRESS,
    functionJson,
    "0",
    `[\"${fromAddress}\", \"${MARKET_CONTRACT_ADDRESS}\", \"${tokenId}\"]`,
    setQrvalue,
    callback
  );
};

// 민팅 기능
export const mintCardWithURI = async (
  toAddress,
  tokenId,
  uri,
  setQrvalue,
  callback
) => {
  const functionJson =
    '{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "tokenURI", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
  excuteContract(
    NFT_CONTRACT_ADDRESS,
    functionJson,
    "0",
    `[\"${toAddress}\", \"${tokenId}\", \"${uri}\"]`,
    setQrvalue,
    callback
  );
};

export const excuteContract = (
  txTo,
  functionJSON,
  value,
  params,
  setQrvalue,
  callback
) => {
  axios
    .post(A2P_API_PREPARE_URL, {
      // 지갑 사용해도 되니?
      bapp: {
        name: APP_NAME,
      },
      type: "execute_contract", // 스마트 컨트렉트 실행하겠다.
      transaction: {
        to: txTo, // 스마트컨드렉트 주소
        abi: functionJSON, // 이 함수를 사용하겠다.
        value: value, // 수수료 (알아서 계산되어 사용됨)
        params: params, // 실헹할 함수의 파리미터는 이렇다.
      },
    })
    .then((response) => {
      const { request_key } = response.data; // 인증키
      if (isMobile) {
        window.location.href = getKlipAccessUrl("android", request_key);
      } else {
        setQrvalue(getKlipAccessUrl("QR", request_key));
      }
      // const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

      let timerId = setInterval(() => {
        // result값이 왔는지 매 초마다 확인
        axios
          .get(
            `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
          )
          .then((res) => {
            if (res.data.result) {
              console.log(`[Result] ${JSON.stringify(res.data.result)}`);
              callback(res.data.result);
              clearInterval(timerId);
              setQrvalue("DEFAULT");
            }
          });
      }, 1000);
    });
};

export const getAddress = (setQrvalue, callback) => {
  axios
    .post(A2P_API_PREPARE_URL, {
      bapp: {
        name: APP_NAME,
      },
      type: "auth",
    })
    .then((response) => {
      const { request_key } = response.data;
      if (isMobile) {
        window.location.href = getKlipAccessUrl("android", request_key);
      } else {
        setQrvalue(getKlipAccessUrl("QR", request_key));
      }
      let timerId = setInterval(() => {
        // result값이 왔는지 매 초마다 확인
        axios
          .get(
            `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
          )
          .then((res) => {
            if (res.data.result) {
              console.log(`Result ${JSON.stringify(res.data.result)}`);
              callback(res.data.result.klaytn_address);
              // result값이 오면, 타이멍해제
              clearInterval(timerId);
              setQrvalue("DEFAULT");
            }
          });
      }, 1000);
    });
};

/*
export const setCount = (count, setQrvalue) => {
  axios
    .post(A2P_API_PREPARE_URL, {
      // 지갑 사용해도 되니?
      bapp: {
        name: APP_NAME,
      },
      type: "execute_contract", // 스마트 컨트렉트 실행하겠다.
      transaction: {
        to: COUNT_CONTRACT_ADDRESS, // 스마트컨드렉트 주소
        abi: ' { "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }',
        // 이 함수를 사용하겠다.
        value: "0", // 수수료 (알아서 계산되어 사용됨)
        params: `[\"${count}"\]`, // 실헹할 함수의 파리미터는 이렇다.
      },
    })
    .then((response) => {
      const { request_key } = response.data; // 인증키
      const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
      setQrvalue(qrcode);
      let timerId = setInterval(() => {
        // result값이 왔는지 매 초마다 확인
        axios
          .get(
            `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
          )
          .then((res) => {
            if (res.data.result) {
              console.log(`Result ${JSON.stringify(res.data.result)}`);
              if (res.data.result.status === "success") {
                // result값이 오면, 타이멍해제
                clearInterval(timerId);
              }
            }
          });
      }, 1000);
    });
};
*/
