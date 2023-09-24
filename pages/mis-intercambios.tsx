import styles from '../styles/pages/my-exchanges/my-exchanges.module.scss';

import {ResponsivePage} from "../components/ResponsivePage";
import {MyExchanges} from "../components/MyExchanges/MyExchanges";
import {wrapper} from "../store/store";
import {directus} from "../utils/constants";
import { withIronSessionSsr } from "iron-session/next";
import {sessionOptions} from "../lib/session";
import {Exchange} from "../types/Exchange";
import {addMinutes} from "date-fns";
import {useEffect, useState} from "react";
import fetchJson from "../lib/fetchJson";
import {useRouter} from "next/router";
import {currencyFormatter} from "../utils/formatter";

const MisIntercambios = ({ intercambios, midMarketPrice, total, deadline, showTimer }: { intercambios: Exchange[]; midMarketPrice?: number; total?: number; deadline?: string; showTimer: boolean }) => {
    const router = useRouter();
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (showTimer) {
            const interval = setInterval(async () => {
                const now = new Date().getTime();
                const time = new Date(deadline).getTime() - now;
                const minutesToExpired = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
                const secondsToExpired = Math.floor((time % (1000 * 60)) / 1000);
                setMinutes(minutesToExpired);
                setSeconds(secondsToExpired);

                if (time < 0) {
                    const response = await fetchJson('/api/expired_exchanges', {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                    });

                    if (response.success) {
                        router.push('/trading');
                    }

                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    return(
        <ResponsivePage>
            <div className={styles.my_exchanges}>
                {intercambios.length > 0 ? (
                    <>
                        <h1 className={styles.my_exchanges__title}>Intercambio de compra</h1>
                        <h2 className={styles.my_exchanges__subtitle}>Precio Mid Market</h2>
                        <h3 className={styles.my_exchanges__mid_point}>S/. {midMarketPrice}</h3>
                        {showTimer && (
                            <>
                                <h3 className={styles.my_exchanges__remaining_title}>Tiempo restante para depositar</h3>
                                <h1 className={styles.my_exchanges__remaining_time}>{minutes}:{seconds}</h1>
                            </>
                        )}
                        <div className={styles.my_exchanges__total}>Total {currencyFormatter(total)} USD</div>
                        <div style={{ alignSelf: 'start' }}>Detalle de los montos a depositar:</div>
                        <MyExchanges intercambios={intercambios} />
                    </>
                ) : (
                    <p>No cuenta con intercambios</p>
                )}
            </div>
        </ResponsivePage>
    );
};

export const getServerSideProps =  wrapper.getServerSideProps((store) => withIronSessionSsr(async function getServerSideProps ({ req }) {
    // @ts-ignore
    const userExchangeHouseId = req.session.user.id_casa_cambio;

    const response = await directus.items('INTERCAMBIO').readByQuery({
        limit: -1,
        filter: {
            id_casa_cambio_taker: userExchangeHouseId,
            '_or': [
                {
                    status: 'ACT',
                },
                {
                    status: 'STB',
                }
            ]
        },
    });

    let showTimer = false;

    if (response.data.length) {
        // @ts-ignore
        const midMarketPrice = response.data[0].precio_midmarket || 0;
        // @ts-ignore
        const total = response.data.reduce((acc, intercambio) => acc + intercambio.monto_usd, 0);

        const intercambios = await Promise.all(
            response.data.map(async intercambio => {
                const {data: posturaIntercambio} = await directus.items('POSTURA_INTERCAMBIO').readByQuery({
                    fields: ['*.*', 'id_postura.POSTURA_id_postura.*'],
                    filter: {
                        id_intercambio: {
                            // @ts-ignore
                            INTERCAMBIO_id_intercambio: intercambio.id_intercambio,
                        },
                    },
                });

                const {data: cuentas} = await directus.items('CUENTA').readByQuery({
                    fields: ['*.*'],
                    filter: {
                        id_casa_cambio: {
                            // @ts-ignore
                            id_casa_cambio: posturaIntercambio[0].id_postura[0].POSTURA_id_postura.id_casa_cambio_maker,
                        },
                        moneda: 'S',
                    },
                });

                // @ts-ignore
                if (intercambio.status === 'ACT') {
                    showTimer = true;
                }

                return {...intercambio, casa_cambio: cuentas[0], postura_intercambio: posturaIntercambio[0]};
            })
        );

        // @ts-ignore
        const deadline = addMinutes(new Date(intercambios[0].fecha_creacion), 10).toISOString();

        return {props: {intercambios, midMarketPrice, total, deadline, showTimer}};
    }

    return {props: { intercambios: [], midMarketPrice: 0, total: 0, deadline: '', showTimer }};
}, sessionOptions));

export default MisIntercambios;
