/**
 * @desc get network name
 * @param  {Number|String} id
 * @return {String}
 */
export const netIdToName = id => {
  switch (parseInt(id, 10)) {
    case 1:
      return 'mainnet';
    case 42:
      return 'kovan';
    case 999:
      return 'ganache';
    default:
      return '';
  }
};
