import React, { useState } from "react";
import logo from "./logo.svg";
import QRCode from "qrcode.react";
import { getBalance, readCount, setCount } from "./api/UseCaver";
import * as KlipAPI from "./api/UseKlip";
import "./App.css";

function onPressButton(balance) {
  console.log("hi");
}

const onPressButton2 = (_balance, _setBalance) => {
  _setBalance("10");
};

const DEFAULT_QR_CODE = "DEFAULT";

function App() {
  // State Data

  // Global Data
  // Addrress
  // nft
  const [balance, setBalance] = useState("0");
  // UI
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);

  // tab
  // mintInput

  // Modal

  // fetchMarketNFTs
  // fetchMyNFTs
  // onClickkMint
  // onClickMyCard
  // onClickMarketCard
  // getUserData
  // getBalance('0x403e9fd0c8f9f5160d387b7a4b4940420e49bf21')

  /*
  const onPressButton2 = (balance) => {
    setBalance("10");
  };
  */

  const onClickGetAddress = () => {
    KlipAPI.getAddress(setQrvalue);
  };

  const onClickSetCount = () => {
    KlipAPI.setCount(2000, setQrvalue);
  };

  // readCount();
  // getBalance("0x403e9fd0c8f9f5160d387b7a4b4940420e49bf21");

  return (
    <div className="App">
      <header className="App-header">
        {/* 주소 잔고 */}
        {/* 갤러리(마켓 내 지갑) */}
        {/* 발행 페이지 */}
        {/* 탭 */}
        {/* 모달 */}
        <img src={logo} className="App-logo" alt="logo" />
        <button
          onClick={() => {
            //onPressButton2("15", setBalance);
            onClickGetAddress();
          }}
        >
          주소 가져오기
        </button>
        <button
          onClick={() => {
            onClickSetCount();
          }}
        >
          카운트 값 변경
        </button>
        <br />
        <QRCode value={qrvalue} />
        <p>{balance}</p>
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
