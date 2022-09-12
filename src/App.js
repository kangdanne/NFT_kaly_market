import React, { useCallback, useEffect, useState } from "react";
import logo from "./logo.svg";
import QRCode from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faWallet, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getBalance, readCount, setCount, fetchCardsOf } from "./api/UseCaver";
import * as KlipAPI from "./api/UseKlip";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./Market.css";
import {
  Alert,
  Container,
  Card,
  Nav,
  Form,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from "./constants";

function onPressButton(balance) {
  console.log("hi");
}

const onPressButton2 = (_balance, _setBalance) => {
  _setBalance("10");
};

const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x00000000000000000000000";

function App() {
  const [nfts, setNfts] = useState([]); // {tokenId: '101', uri: ''}
  const [myBalance, setMyBalance] = useState("0");
  const [myAddress, setMyBAddress] = useState("0x00000000000000000000000");
  // UI
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);

  // tab
  const [tab, setTab] = useState("MARKET"); // MARKET, MINT, WALLET
  // mintInput
  const [mintImageUrl, setMintImageUrl] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "MODAL",
    onConfirm: () => {},
  });

  const rows = nfts.slice(nfts.length / 2);

  // fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  };

  // fetchMyNFTs
  const fetchMyNFTs = async () => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    // [{tokenId:100, tokenUri : "http://dgas.png"}, {tokenId:101, tokenUri : "http://ddasg.png"}]
    const _nfts = await fetchCardsOf(myAddress);
    setNfts(_nfts);
    // 배열에게 될 데이터 값은 'array'
    // balanceOf -> 내가 가진 전체 NFT 토큰 개수 (2개)

    // tokenOfOwnerByIndex -> 내가 가진 NFT token ID를 하나씩 가져온다 [배열로]
    // 0x530E9237DF8E43ABF594e7145F96E9EDeD3e25F6, 0 => 100
    // 0x530E9237DF8E43ABF594e7145F96E9EDeD3e25F6, 1 => 101

    // tokenURI -> 앞에서 가져온 tokenID를 이용해서 toeknURI를 하나씩 가저온다.
    // 100 -> qwerty.png
    // 101 -> asdfg.png
  };

  // onClickkMint
  const onClickMint = async (uri) => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }

    const randomTokenId = parseInt(Math.random() * 10000000);
    KlipAPI.mintCardWithURI(
      myAddress,
      randomTokenId,
      uri,
      setQrvalue,
      (result) => {
        alert(JSON.stringify(result));
      }
    );
  };

  const onClickCard = (id) => {
    if (tab === "WALLET") {
      setModalProps({
        title: "NFT를 마켓에 올리시겠어요?",
        onConfirm: () => {
          onClickMyCard(id);
        },
      });
      setShowModal(true);
    }
    if (tab === "MARKET") {
      setModalProps({
        title: "NFT를 구매하시겠어요?",
        onConfirm: () => {
          onClickMarketCard(id);
        },
      });
      setShowModal(true);
    }
  };

  // onClickMyCard
  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  };

  // onClickMarketCard
  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  };

  // getUserData

  const getUserData = () => {
    setModalProps({
      title: "Klip 지갑을 연동하시겠습니까?",
      onConfirm: () => {
        KlipAPI.getAddress(setQrvalue, async (address) => {
          setMyBAddress(address);
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      },
    });
    setShowModal(true);
  };
  // getBalance("0x403e9fd0c8f9f5160d387b7a4b4940420e49bf21");

  // 앱에 처음 접속 했을 때, 일어날 기능들
  useEffect(() => {
    getUserData();
    fetchMarketNFTs();
  }, []);

  return (
    <div className="App">
      <div style={{ backgroundColor: "black", padding: 10 }}>
        <div>내 지갑</div>
        {myAddress}
        <br />
        <Alert
          onClick={getUserData}
          variant={"balance"}
          style={{ backgroundColor: "lightblue", fontSize: 25 }}
        >
          {myAddress !== DEFAULT_ADDRESS
            ? `${myBalance} KLAY`
            : "지갑 연동하기"}
        </Alert>
        {qrvalue !== "DEFAULT" ? (
          <Container
            style={{
              backgroundColor: "white",
              width: 300,
              height: 300,
              padding: 20,
            }}
          >
            <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />
          </Container>
        ) : null}
        <br />
        <br />
        {/* 갤러리(마켓 내 지갑) */}
        {tab === "MARKET" || tab === "WALLET" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  <Card
                    onClick={() => {
                      onClickCard(nfts[rowIndex * 2].id);
                    }}
                  >
                    <Card.Img src={nfts[rowIndex * 2].uri} />
                  </Card>
                  [{nfts[rowIndex * 2].id}]NFT
                </Col>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card
                      onClick={() => {
                        onClickCard(nfts[rowIndex * 2 + 1].id);
                      }}
                    >
                      <Card.Img src={nfts[rowIndex * 2 + 1].uri} />
                    </Card>
                  ) : null}
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <>[{nfts[rowIndex * 2 + 1].id}]NFT</>
                  ) : null}
                </Col>
              </Row>
            ))}
          </div>
        ) : null}

        {/* 발행 페이지 */}
        {tab === "MINT" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            <Card
              className="text-center"
              style={{ color: "black", height: "50%", borderColor: "#C5B358" }}
            >
              <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
                {mintImageUrl !== "" ? (
                  <Card.Img src={mintImageUrl} height={"50%"} />
                ) : null}
                <Form>
                  <Form.Group>
                    <Form.Control
                      value={mintImageUrl}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintImageUrl(e.target.value);
                      }}
                      type="text"
                      placeholder="이미지 주소를 입력해주세요"
                    />
                  </Form.Group>
                  <Button
                    onClick={() => onClickMint(mintImageUrl)}
                    variant="primary"
                    style={{
                      backgroundColor: "#810034",
                      borderColor: "#810034",
                    }}
                  >
                    발행하기
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        ) : null}
      </div>
      <br />
      <br />
      <br />
      <br />
      {/* 주소 잔고 */}
      {/* <button onClick={fetchMyNFTs}>NFT가져오기</button> */}

      {/* 모달 */}
      <Modal
        centered
        size="sm"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
      >
        <Modal.Header
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Modal.Title>{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Footer
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
            }}
          >
            닫기
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              modalProps.onConfirm();
              setShowModal(false);
            }}
            style={{ backgroundColor: "#810034", borderColor: "#810034" }}
          >
            진행
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 탭 */}
      <nav
        style={{ backgroundColor: "#1b1717", height: 45 }}
        className="navbar fixed-bottom navbar-light"
        role="navigation"
      >
        <Nav className="w-100">
          <div className="d-flex flex-row justify-content-around w-100">
            <div
              onClick={() => {
                setTab("MARKET");
                fetchMarketNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faHome} />
              </div>
            </div>

            <div
              onClick={() => {
                setTab("MINT");
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faPlus} />
              </div>
            </div>

            <div
              onClick={() => {
                setTab("WALLET");
                fetchMyNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faWallet} />
              </div>
            </div>
          </div>
        </Nav>
      </nav>
    </div>
  );
}

export default App;
