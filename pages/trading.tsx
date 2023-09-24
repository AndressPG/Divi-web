import styles from "../styles/pages/trading/trading.module.scss";

import {ResponsivePage} from "../components/ResponsivePage";
import {Offers} from "../components/Offers/Offers";
import {directus} from "../utils/constants";
import {wrapper} from "../store/store";
import {selectPosturaState, setPosturas} from "../store/reducers/postura.reducer";
import {Postura} from "../types/Postura";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useSocketContext} from "../context/socket/context";
import {setBanks} from "../store/reducers/bank.reducer";
import {Bank} from "../types/Bank";
import {checkIntercambios} from "../utils/checkIntercambios";
import {MidPriceMarket} from "../components/MidPriceMarket/MidPriceMarket";
import {withIronSessionSsr} from "iron-session/next";
import {sessionOptions} from "../lib/session";
import {selectAuthState, setAuthState} from "../store/reducers/auth.reducer";

const Trading = ({ midMarketPrice, user }: { midMarketPrice: number; user: any }) => {
    const { socket } = useSocketContext();
    const { compras, ventas } = useSelector(selectPosturaState);
    const { isLoggedIn } = useSelector(selectAuthState);
    const dispatch = useDispatch();

    useEffect(() => {
        if (socket) {
            socket.on('update-posturas', postura => {
                let newCompras = compras;
                let newVentas = ventas;

                if (postura.tipo === 'C') {
                    newCompras = newCompras.concat(postura);
                }

                if (postura.tipo === 'V') {
                    newVentas = newVentas.concat(postura);
                }

                dispatch(setPosturas({ compras: newCompras, ventas: newVentas }));
            });
        }
    }, [socket]);

    useEffect(() => {
        if (!isLoggedIn && user) {
            dispatch(setAuthState(user));
        }
    }, []);

    return (
        <ResponsivePage>
            <div className={styles.trading}>
                <h1 className={styles.trading__title}>Trading</h1>
                <h2 className={styles.trading__subtitle}>Precio Mid Market</h2>
                <MidPriceMarket midMarketPrice={midMarketPrice} />
                <Offers />
            </div>
        </ResponsivePage>
    );
};

export const getServerSideProps =  wrapper.getServerSideProps((store) => withIronSessionSsr(async function getServerSideProps ({ req }) {
    const response = await directus.items('POSTURA').readByQuery({
        limit: -1,
        filter: {
            status: 'ACT',
        },
        // @ts-ignore
        sort: ['date_created'],
    });

    const { data: posturaIntercambio } = await directus.items('POSTURA_INTERCAMBIO').readByQuery({
        limit: -1,
        fields: ['*', 'id_postura.POSTURA_id_postura', 'id_intercambio.INTERCAMBIO_id_intercambio.*']
    });

    const responseBanks = await directus.items('BANCO').readByQuery({
        limit: -1,
        filter: {
            status: 'published',
        },
    });

    const { data: banks } = await responseBanks;

    const result = await response;

    const data = result.data as Postura[];

    const [compras, ventas] = data.reduce<[Postura[], Postura[]]>((acc, postura) => {
        const posturaWithExchanges = checkIntercambios(postura, posturaIntercambio);
        if (posturaWithExchanges.tipo === 'C') {
            return [acc[0].concat(posturaWithExchanges), acc[1]];
        }

        return [acc[0], acc[1].concat(posturaWithExchanges)];
    }, [[], []]);

    // @ts-ignore
    await store.dispatch(setPosturas({ compras, ventas }));
    await store.dispatch(setBanks(banks as Bank[]));

    const { data: midMarketPriceData } = await directus.items('MID_MARKET_PRICE').readByQuery({
        limit: -1,
    });

    // @ts-ignore
    const { price } = midMarketPriceData[0];

    // @ts-ignore
    const user = req.session.user;

    return { props: { midMarketPrice: price, user } };
}, sessionOptions));

export default Trading;
