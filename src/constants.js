const CONTRACT_ADDRESS = "0xBE0b32C1336519d8E6b38f8b016dd13A26a4becc";

const transformSpellData = (spellData) => {
  return {
    name: spellData.name,
    imageURI: spellData.imageURI,
    concentration: spellData.concentration.toNumber(),
    maxConcentration: spellData.maxConcentration.toNumber(),
    attackDamage: spellData.attackDamage.toNumber(),
  };
};

const transformBossData = (bossData) => {
  return {
    name: bossData.name,
    imageURI: bossData.imageURI,
    hp: bossData.hp.toNumber(),
    maxHp: bossData.maxHp.toNumber(),
    attackDamage: bossData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformSpellData, transformBossData };
