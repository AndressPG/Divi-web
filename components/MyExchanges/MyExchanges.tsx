import styles from "../../styles/components/MyExchanges/MyExchanges.module.scss";
import {Button, Dropdown, MenuProps} from "antd";
import React, {useEffect, useState} from "react";
import {Exchange} from "../../types/Exchange";
import fetchJson from "../../lib/fetchJson";
import {useRouter} from "next/router";
import {currencyFormatter} from "../../utils/formatter";

const items: MenuProps['items'] = [
    {
        key: '1',
        label: (
            <a rel="noopener noreferrer" href="#">
                Opcion 1
            </a>
        ),
    },

    {
        key: '2',
        label: (
            <a rel="noopener noreferrer" href="#">
                Opcion 2
            </a>
        ),
    },

    {
        key: '3',
        label: (
            <a rel="noopener noreferrer" href="#">
                Opcion 3
            </a>
        ),
    },
];

export const MyExchanges = ({ intercambios }: { intercambios: Exchange[] }) => {
    const route = useRouter();

    const [myExchanges, setMyExchanges] = useState<Exchange[]>(intercambios);

    const handleOnClick = async (intercambio: Exchange) => {
        try {

            const response = await fetchJson('/api/confirm_deposit_taker', {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ posturaIntercambioId: intercambio.postura_intercambio.id_postura_intercambio, intercambioId: intercambio.id_intercambio }),
            });

            if (response.success) {
                route.reload();
            }

        } catch (e) {
            console.log(e);
        }
    };

    const handleOnCancel = async (intercambio: Exchange) => {
        try {

            const response = await fetchJson('/api/cancel_exchange', {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ posturaIntercambioId: intercambio.postura_intercambio.id_postura_intercambio, intercambioId: intercambio.id_intercambio }),
            });

            if (response.success) {
                route.reload();
            }

        } catch (e) {
            console.log(e);
        }
    };

    return (
    <>
        {myExchanges.length > 0 && myExchanges.map(intercambio => (
            <div className={styles.my_exchange} key={intercambio.id_intercambio}>

                <span className={styles.my_exchange__title}>{intercambio.casa_cambio.id_casa_cambio.nombre_comercial}</span>

                <div>
                    {/* @ts-ignore */}
                    {intercambio.postura_intercambio.id_postura[0].POSTURA_id_postura.tipo === 'C' ? 'Vendido' : 'Compra'}: {currencyFormatter(intercambio.monto_usd)} USD
                </div>

                <div>
                    {/* @ts-ignore */}
                    Depositar: <b>{intercambio.postura_intercambio.id_postura[0].POSTURA_id_postura.tipo === 'C' ? `${currencyFormatter(intercambio.monto_usd)} USD` : `${currencyFormatter(intercambio.monto_usd * intercambio.precio_midmarket)} PEN`}</b>
                </div>

                <div style={{ marginTop: 20 }}>
                    {intercambio.casa_cambio.id_banco.nombre_banco}
                </div>

                <div>
                    Cuenta: {intercambio.casa_cambio.numero_cuenta}
                </div>

                <div>
                    CCI: {intercambio.casa_cambio.cci}
                </div>

                {intercambio.postura_intercambio?.fecha_deposito_taker ? (
                    <>
                    <span className={styles.my_exchange__deposit_confirm}>¡Casa de cambios notificada, deposito en proceso!</span>
                        <Dropdown menu={{ items }} placement="bottomLeft" arrow={{ pointAtCenter: true }}>
                            <Button type="text" htmlType="button" className={styles.my_exchange__cancel}>
                                Informar de un inciente con esta orden
                            </Button>
                        </Dropdown>
                    </>
                ) : (
                    <>
                        <Button type="text" htmlType="button" className={styles.my_exchange__deposit} onClick={() => handleOnClick(intercambio)}>
                            Depositado, notificar a la CCD
                        </Button>

                        <Button type="text" htmlType="button" className={styles.my_exchange__cancel} onClick={() => handleOnCancel(intercambio)}>
                            {/* @ts-ignore */}
                            Cancelar esta {intercambio.postura_intercambio.id_postura[0].POSTURA_id_postura.tipo === 'C' ? 'compra' : 'venta'}
                        </Button>
                    </>
                    )}

            </div>
        ))}
    </>
    );
};
