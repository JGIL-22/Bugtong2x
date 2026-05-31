import { avatars } from '../data/gamedata';

export const getAvatarUrl = (idOrName: string) => {
  const avatarObj = avatars.find(a => a.id === idOrName || a.name === idOrName);
  const name = avatarObj ? avatarObj.name : idOrName;
  const gender = avatarObj ? avatarObj.gender : 'N';
  const seed = encodeURIComponent(name);

  if (gender === 'F') {
    const topOptions = 'longHairBob,longHairBigHair,longHairCurly,longHairCurvy,longHairDreads,longHairFrida,longHairFro,longHairFroBand,longHairMiaWallace,longHairNotTooLong,longHairShavedSides,longHairStraight,longHairStraight2,longHairStraightStrand';
    const accessories = 'blank,kurt,prescription01,prescription02,round,sunglasses';
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&top=${topOptions}&facialHairProbability=0&accessories=${accessories}`;
  } else if (gender === 'M') {
    const topOptions = 'shortHairDreads01,shortHairDreads02,shortHairFrizzle,shortHairShaggyMullet,shortHairShortCurly,shortHairShortFlat,shortHairShortRound,shortHairShortWaved,shortHairSides,shortHairTheCaesar,shortHairTheCaesarSidePart,noHair';
    const facialHair = 'beardMedium,beardLight,beardMajestic,moustacheFancy,moustacheMagnum,blank';
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&top=${topOptions}&facialHair=${facialHair}&facialHairProbability=40`;
  } else {
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`;
  }
};
