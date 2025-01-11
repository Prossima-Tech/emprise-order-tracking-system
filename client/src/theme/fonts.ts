// // src/theme/fonts.ts
// // Define font files
// import PoppinsRegularWoff2 from '../assets/fonts/Poppins-Regular.woff2';
// import PoppinsMediumWoff2 from '../assets/fonts/Poppins-Medium.woff2';
// import PoppinsSemiBoldWoff2 from '../assets/fonts/Poppins-SemiBold.woff2';

// // Create font-face declarations
// export const fontFaces = `
//   @font-face {
//     font-family: 'Poppins';
//     src: url('${PoppinsRegularWoff2}') format('woff2');
//     font-weight: 400;
//     font-style: normal;
//     font-display: swap;
//   }
  
//   @font-face {
//     font-family: 'Poppins';
//     src: url('${PoppinsMediumWoff2}') format('woff2');
//     font-weight: 500;
//     font-style: normal;
//     font-display: swap;
//   }
  
//   @font-face {
//     font-family: 'Poppins';
//     src: url('${PoppinsSemiBoldWoff2}') format('woff2');
//     font-weight: 600;
//     font-style: normal;
//     font-display: swap;
//   }
// `;

// // Create a style element and inject font faces
// export const injectFontFaces = () => {
//   const style = document.createElement('style');
//   style.textContent = fontFaces;
//   document.head.appendChild(style);
// };