import React, { useEffect, useState } from "react";
import "./Arena.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformBossData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import LoadingIndicator from "../LoadingIndicator";

const Arena = ({ spellNFT, setSpellNFT }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");
  const [showToast, setShowToast] = useState(false);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
        setAttackState("hit");

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error attacking boss:", error);
      setAttackState("");
    }
  };

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("Boss:", bossTxn);
      setBoss(transformBossData(bossTxn));
    };

    const onAttackComplete = (newBossHp, newPlayerConcentration) => {
      const bossHp = newBossHp.toNumber();
      const playerConcentration = newPlayerConcentration.toNumber();

      console.log(
        `AttackComplete: Boss Hp: ${bossHp} Player Concentration: ${playerConcentration}`
      );

      setBoss((prevState) => {
        return { ...prevState, hp: bossHp };
      });

      setSpellNFT((prevState) => {
        return { ...prevState, concentration: playerConcentration };
      });
    };

    if (gameContract) {
      fetchBoss();
      gameContract.on("AttackComplete", onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    };
  }, [gameContract]);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
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

  return (
    <div className="arena-container">
      {boss && (
        <div id="toast" className={showToast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} was hit for ${spellNFT.attackDamage}!`}</div>
        </div>
      )}
      {/* Boss */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img
                src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`}
                alt={`Boss ${boss.name}`}
              />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
          {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}

      {/* Spell NFT */}
      {spellNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Spell</h2>
            <div className="player">
              <div className="image-content">
                <h2>{spellNFT.name}</h2>
                <img
                  src={`https://cloudflare-ipfs.com/ipfs/${spellNFT.imageURI}`}
                  alt={`Character ${spellNFT.name}`}
                />
                <div className="health-bar">
                  <progress
                    value={spellNFT.concentration}
                    max={spellNFT.maxConcentration}
                  />
                  <p>{`${spellNFT.concentration} / ${spellNFT.maxConcentration} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${spellNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
