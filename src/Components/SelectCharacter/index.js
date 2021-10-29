import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import LoadingIndicator from "../LoadingIndicator";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformSpellData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";

const SelectSpell = ({ setSpellNFT }) => {
  const [spells, setSpells] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingSpell, setMintingSpell] = useState(false);

  const mintSpellNFTAction = (spellId) => async () => {
    try {
      if (gameContract) {
        setMintingSpell(true);
        console.log("Minting spell in progress...");
        const mintTxn = await gameContract.mintSpellNFT(spellId);
        await mintTxn.wait();
        console.log("mintTxn", mintTxn);
        setMintingSpell(false);
      }
    } catch (error) {
      console.warn("MintSpellAction Error:", error);
      setMintingSpell(false);
    }
  };

  const renderSpells = () => {
    return spells.map((spell, index) => (
      <div className="character-item" key={spell.name}>
        <div className="name-container">
          <p>{spell.name}</p>
        </div>
        <img
          src={`https://cloudflare-ipfs.com/ipfs/${spell.imageURI}`}
          alt={spell.name}
        />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintSpellNFTAction(index)}
        >{`Mint ${spell.name}`}</button>
      </div>
    ));
  };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getSpells = async () => {
      try {
        console.log("Getting contract spells to mint");

        const spellTxn = await gameContract.getAllDefaultSpells();
        console.log("spellTxn:", spellTxn);

        const spells = spellTxn.map((spellData) => {
          return transformSpellData(spellData);
        });

        setSpells(spells);
      } catch (error) {
        console.error("Something went wrong fetching spells:", error);
      }
    };

    const onSpellMint = async (sender, tokenId, spellIndex) => {
      console.log(
        `SpellNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} spellIndex: ${spellIndex.toNumber()}`
      );

      if (gameContract) {
        const spellNFT = await gameContract.checkIfUserHasNFT();
        console.log("SpellNFT: ", spellNFT);
        setSpellNFT(transformSpellData(spellNFT));
      }
    };

    if (gameContract) {
      getSpells();

      gameContract.on("SpellNFTMinted", onSpellMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off("SpellNFTMinted", onSpellMint);
      }
    };
  }, [gameContract]);

  return (
    <div className="select-character-container">
      <h2>Mint Your Spell. Choose wisely.</h2>
      {spells.length > 0 && (
        <div className="character-grid">{renderSpells()}</div>
      )}
      {mintingSpell && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  );
};

export default SelectSpell;
