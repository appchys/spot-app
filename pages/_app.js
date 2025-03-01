// pages/_app.js
import "../styles/globals.css"; // IMPORTA LOS ESTILOS AQUÍ

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
