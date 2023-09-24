import styles from "../../styles/pages/trading/trading.module.scss";
import {useEffect, useState} from "react";
import {useSocketContext} from "../../context/socket/context";
import {currencyFormatter} from "../../utils/formatter";

export const MidPriceMarket = ({ midMarketPrice }: { midMarketPrice: number }) => {
    const [price, setPrice] = useState(midMarketPrice);
    const { socket } = useSocketContext();

  //  useEffect(() => {
  //      if (socket) {
  //          socket.on('set-mid-price-market', compra => {
  //              setPrice(compra);
  //          });
  //      }
  //  }, [socket]);
  //
  //  useEffect(() => {
  //      const interval = setInterval(() => {
  //          if (socket) {
  //              socket.emit('get-mid-price-market');
  //          }
  //      }, 5000);
  //
  //      return () => clearInterval(interval);
  //  }, []);

    return (
        <h1 className={styles.trading__mid_point}>{`S/. ${currencyFormatter(price)}`}</h1>
    );
};
