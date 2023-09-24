import './styles.css';
import 'antd/dist/antd.css';
import {wrapper} from "../store/store";
import {SocketProvider} from "../context/socket/SocketProvider";

// This default export is required in a new `pages/_app.js` file.
function MyApp({ Component, pageProps }) {
  return (
      <SocketProvider>
          <Component {...pageProps} />
      </SocketProvider>
  );
}

export default wrapper.withRedux(MyApp);
