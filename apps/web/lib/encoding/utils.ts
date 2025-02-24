// lib/encoding/utils.ts

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export const encodeBasic = (text: string): string => {
  return text
    .toLowerCase()
    .split('')
    .map((char) => {
      if (char === ' ') return '0';
      const position = ALPHABET.indexOf(char) + 1;
      return position.toString();
    })
    .join('-');
};

export const decodeBasic = (encoded: string): string => {
  return encoded
    .split('-')
    .map((num) => {
      if (num === '0') return ' ';
      const position = parseInt(num) - 1;
      return ALPHABET[position] || '';
    })
    .join('');
};

export const encodeShift = (text: string, shift: number): string => {
  return text
    .toLowerCase()
    .split('')
    .map((char) => {
      if (char === ' ') return shift.toString();
      const position = ((ALPHABET.indexOf(char) + shift) % 26) + 1;
      return position.toString();
    })
    .join('-');
};

export const decodeShift = (encoded: string, shift: number): string => {
  return encoded
    .split('-')
    .map((num) => {
      if (num === shift.toString()) return ' ';
      let position = parseInt(num) - 1 - shift;
      if (position < 0) position += 26;
      return ALPHABET[position] || '';
    })
    .join('');
};

export const encodeMultiplicative = (
  text: string,
  multiplier: number,
  increment: number
): string => {
  return text
    .toLowerCase()
    .split('')
    .map((char) => {
      if (char === ' ') return increment.toString();
      const position = ALPHABET.indexOf(char) + 1;
      return (position * multiplier + increment).toString();
    })
    .join('-');
};

export const decodeMultiplicative = (
  encoded: string,
  multiplier: number,
  increment: number
): string => {
  return encoded
    .split('-')
    .map((num) => {
      if (num === increment.toString()) return ' ';
      const position = Math.floor((parseInt(num) - increment) / multiplier) - 1;
      return ALPHABET[position] || '';
    })
    .join('');
};
