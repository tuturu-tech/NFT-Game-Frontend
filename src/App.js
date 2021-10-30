import React, { useEffect, useState } from "react";
import myEpicGame from "./utils/MyEpicGame.json";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import SelectSpell from "./Components/SelectCharacter";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";
import { CONTRACT_ADDRESS, transformSpellData } from "./constants";
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = "TuturuTech";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [spellNFT, setSpellNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      setIsLoading(false);

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    console.log(currentAccount);

    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img src="https://i.gifer.com/XDZT.gif" alt="Future" />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !spellNFT) {
      return <SelectSpell setSpellNFT={setSpellNFT} />;
    } else if (currentAccount && spellNFT) {
      return <Arena spellNFT={spellNFT} setSpellNFT={setSpellNFT} />;
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Spell NFT on address: ", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has spell NFT");
        setSpellNFT(transformSpellData(txn));
      } else {
        console.log("No spell NFT founds");
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Spell Slayer ⚔️</p>
          <p className="sub-text">
            Team up to protect the world from sleeping in pods and eating bugs!
          </p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE} with _buildspace`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
