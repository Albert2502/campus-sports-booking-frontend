// Admin controls follow the Figma frames (48px, 10px radius), unlike the
// compact shared Button used by the user pages.
const BASE =
  'inline-flex h-12 items-center justify-center rounded-[10px] px-5 text-base font-bold transition-colors disabled:cursor-not-allowed';

export const adminButton = {
  primary: `${BASE} bg-principala text-white hover:bg-principala-inchis disabled:bg-gray-300 disabled:text-gray-500`,
  outline: `${BASE} bg-suprafata text-principala ring-1 ring-principala hover:bg-fundal disabled:text-gray-400 disabled:ring-gray-300`,
};

export const adminInput =
  'h-12 w-full rounded-[10px] bg-suprafata px-3 text-base ring-1 outline-none focus:ring-2 focus:ring-principala';
