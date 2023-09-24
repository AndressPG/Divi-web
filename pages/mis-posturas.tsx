import styles from '../styles/pages/my-offers/my-offers.module.scss';

import {ResponsivePage} from "../components/ResponsivePage";
import {directus} from "../utils/constants";
import {withIronSessionSsr} from "iron-session/next";
import {sessionOptions} from "../lib/session";
import {Postura, PosturaStatus} from "../types/Postura";
import {format} from "date-fns";
import {checkIntercambiosWithBankAccounts} from "../utils/checkIntercambios";
import {Exchange, ExchangeStatus} from "../types/Exchange";
import {Button, Col, Row, Tabs, TabsProps} from "antd";
import React, {useState} from "react";
import {useRouter} from 'next/router';
import fetchJson from "../lib/fetchJson";
import {currencyFormatter} from "../utils/formatter";

const FILTER_OPTIONS = [
    {
        label: 'Activas',
        value: PosturaStatus.Active
    },
    {
        label: 'Stand by',
        value: PosturaStatus.StandBy
    },
    {
        label: 'Cerrada',
        value: PosturaStatus.Closed
    },
    {
        label: 'Cancelada',
        value: PosturaStatus.Canceled
    }
];

const MisPosturas = ({ posturas }: { posturas: Postura[] }) => {
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `Activas`,
            children: <Posturas posturas={posturas.filter(postura => postura.status === PosturaStatus.Active || postura.status === PosturaStatus.StandBy)} />,
        },

        {
            key: '2',
            label: `Cerradas`,
            children: <Posturas posturas={posturas.filter(postura => postura.status === PosturaStatus.Closed)} />,
        },

        {
            key: '3',
            label: `Canceladas`,
            children: <Posturas posturas={posturas.filter(postura => postura.status === PosturaStatus.Canceled || postura.status === PosturaStatus.Expired)} />,
        },
    ];

    return (
        <ResponsivePage>
            <div className={styles.my_offers}>
                <Row>
                    <Col span={24}>
                        <Tabs defaultActiveKey="1" items={items} centered />
                    </Col>
                </Row>
            </div>
        </ResponsivePage>
    );
};

const Posturas = ({ posturas }: { posturas: Postura[] }) => {
    const [offers, setOffers] = useState(posturas);
    const router = useRouter();

    const handleClick = async (offerId: string) => {
        await router.push(`/detalle-postura/${offerId}`);
    };

    const countExchangesByStatus = (status: ExchangeStatus, exchanges?: Exchange[]): number => {
        if (!exchanges) {
            return 0;
        }

        return exchanges.reduce<number>((acc, exchange) => {
            if (exchange.status === status) {
                return acc + 1;
            }

            return acc;
        }, 0);
    };

    const handleCancelPostura = async (posturaId: string) => {
        try {
            const response = await fetchJson('/api/cancel_postura', {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ posturaId }),
            });

            if (response.success) {
                const updatedPosturas = offers.map(postura => {
                    if (postura.id_postura === posturaId) {
                        postura.status = PosturaStatus.Canceled;
                    }

                    return postura;
                });

                setOffers([...updatedPosturas]);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            {offers.length > 0 && offers.map((postura, index) => (
                <div className={styles.my_offers__info} key={`postura-${postura.id_postura}`} onClick={() => handleClick(postura.id_postura)}>

                    <b>Postura{index + 1} - {postura.tipo === 'C' ? 'Compra' : 'Venta'}{postura.status === PosturaStatus.Canceled ? ' - Cancelada': ''}{postura.status === PosturaStatus.Expired ? ' - Caducada': ''}</b>
                    <b>Monto: {currencyFormatter(postura.monto_usd)} USD</b>

                    <div>{postura.tipo === 'C' ? 'Comprados' : 'Vendidos'}: {currencyFormatter(postura.monto_usd - postura.monto_pendiente)}
                        USD
                    </div>

                    <div>
                        Pendientes: {currencyFormatter(postura.monto_pendiente)} USD
                        {(postura.status !== PosturaStatus.Canceled && postura.status !== PosturaStatus.Expired && postura.monto_pendiente !== 0) && (
                            <Button onClick={() => handleCancelPostura(postura.id_postura)} type='primary' style={{ marginLeft: 5 }} danger>Cancelar</Button>
                        )}
                    </div>

                    <div>
                        Creada: {format(new Date(postura.date_created), 'hh:mmaaa dd/MM/yyyy')}
                    </div>

                    <div>
                        {typeof postura.bankAccount.id_banco !== "number" ? postura.bankAccount.id_banco?.nombre_banco : ''} / {postura.bankAccount.moneda === 'S' ? 'Soles' : 'Dólares'}
                    </div>

                    {postura.intercambios && postura.intercambios.length > 0 ? (
                        <>
                            {countExchangesByStatus(ExchangeStatus.Active, postura.intercambios) > 0 && (
                                <div className={styles.my_offers__info__message}>
                                    {countExchangesByStatus(ExchangeStatus.Active, postura.intercambios)} intercambio por atender
                                </div>
                            )}

                            {countExchangesByStatus(ExchangeStatus.StandBy, postura.intercambios) > 0 && (
                                <div className={styles.my_offers__info__message}>
                                    {countExchangesByStatus(ExchangeStatus.StandBy, postura.intercambios)} intercambio en proceso
                                </div>
                            )}

                            {countExchangesByStatus(ExchangeStatus.Done, postura.intercambios) > 0 && (
                                <div className={styles.my_offers__info__message}>
                                    {countExchangesByStatus(ExchangeStatus.Done, postura.intercambios)} intercambio ejecutado
                                </div>
                            )}
                        </>
                    ) : (
                        <b>Sin intercambios</b>
                    )}
                </div>
            ))}
        </>
    );
}


export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
        // @ts-ignore
        const user = req.session?.user;
        const { data: posturasRaw } = await directus.items('POSTURA').readByQuery({
            limit: -1,
            filter: {
                id_casa_cambio_maker: user.id_casa_cambio,
                '_or': [
                    {
                        status: 'ACT',
                    },
                    {
                        status: 'SBY',
                    },
                    {
                        status: 'CAN',
                    },
                    {
                        status: 'CER',
                    },
                    {
                        status: 'CAD',
                    }
                ]
            },
            fields: ['*.*'],
            // @ts-ignore
            sort: ['-date_created'],
        });

        const { data: posturaIntercambio } = await directus.items('POSTURA_INTERCAMBIO').readByQuery({
            limit: -1,
            fields: ['*', 'id_postura.POSTURA_id_postura', 'id_intercambio.INTERCAMBIO_id_intercambio.*']
        });

        const posturas = await Promise.all(
            posturasRaw.map(async postura => {
                const posturaWithExchanges = await checkIntercambiosWithBankAccounts(postura as Postura, posturaIntercambio);

                const {data: cuentas} = await directus.items('CUENTA').readByQuery({
                    fields: ['*.*'],
                    filter: {
                        id_casa_cambio: {
                            // @ts-ignore
                            id_casa_cambio: postura.id_casa_cambio_maker.id_casa_cambio,
                        },
                        moneda: 'S',
                    },
                });

                return {...posturaWithExchanges, bankAccount: cuentas[0]}
            })
        );

        return { props: { posturas } };
    },
    sessionOptions
);

export default MisPosturas;
