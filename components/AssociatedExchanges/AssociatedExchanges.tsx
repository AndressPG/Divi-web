import styles from '../../styles/components/AssociatedExchanges/AssociatedExchanges.module.scss';
import {Button, Divider, Dropdown, MenuProps} from "antd";
import React, {useState} from "react";
import {Exchange, ExchangeStatus} from "../../types/Exchange";
import {TimerExchange} from "../TimerExchange/TimerExchange";
import fetchJson from "../../lib/fetchJson";
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

export const AssociatedExchanges = ({ exchanges, tipo }: { exchanges: Exchange[]; tipo: string }) => {

    const [myExchanges, setMyExchanges] = useState<Exchange[]>(exchanges);

    if (!exchanges) {
        return <p>Esta postura no cuenta con intercambios</p>;
    }

    const handleOnClick = async (intercambio: Exchange) => {

        try {
            const response = await fetchJson('/api/confirm_deposit_maker', {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ intercambioId: intercambio.id_intercambio }),
            });

            if (response.success) {
                const updatedExchanges = myExchanges.map(exchange => {
                    if (exchange.id_intercambio === intercambio.id_intercambio) {
                        exchange.status = ExchangeStatus.Done;
                    }

                    return exchange;
                });

                setMyExchanges([...updatedExchanges]);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return(
        <div className={styles.my_offers}>
            <h1 className={styles.my_offers__title}>Intercambios asociados</h1>

            {myExchanges.length > 0 && myExchanges.map(exchange => (
                <div key={exchange.id_intercambio}>
                    <div className={styles.my_offers__item}>

                        <h2 className={styles.my_offers__item__name}>{typeof exchange.bankAccount?.id_casa_cambio !== "number" ? exchange.bankAccount?.id_casa_cambio.nombre_comercial :''}</h2>

                        <div>
                            {tipo === 'C' ? 'Vendieron' : 'Compraron'}: {currencyFormatter(exchange.monto_usd)} USD
                        </div>

                        <div>
                            Precio: {exchange.precio_midmarket} PEN
                        </div>

                        {exchange.status === ExchangeStatus.Expired && (
                            <div>
                                Este intercambio expiro
                            </div>
                        )}

                        {exchange.status === ExchangeStatus.Active && (
                            <TimerExchange date={exchange.fecha_creacion} />
                        )}

                        {exchange.status === ExchangeStatus.StandBy && (
                        <>
                            <div>
                                Informaron el deposito: {tipo === 'C' ? `${currencyFormatter(exchange.monto_usd)} USD` : `S/. ${currencyFormatter(exchange.monto_usd * exchange.precio_midmarket)}`}
                            </div>

                            <div className={styles.my_offers__item__remaining_time}>
                                ¡Verificar el deposito en la cuenta de banco! Una vez verificado ejecutar el deposito segun los siguientes datos:
                            </div>

                            <div>
                                Depositar: {tipo === 'C' ? `${currencyFormatter(exchange.monto_usd * exchange.precio_midmarket)} PEN`: `${currencyFormatter(exchange.monto_usd)} USD`}
                            </div>

                            <div>
                                {typeof exchange.bankAccount.id_banco !== "number" ? exchange.bankAccount.id_banco?.nombre_banco : ''} / {exchange.bankAccount.moneda === 'S' ? 'Soles' : 'Dólares'}
                            </div>

                            <div>
                                Cuenta: {exchange.bankAccount.numero_cuenta}
                            </div>

                            <div>
                                CCI: {exchange.bankAccount.cci}
                            </div>

                            <Button type="text" htmlType="button" className={styles.my_offers__item__button} onClick={() => handleOnClick(exchange)}>
                                Verificado y depositado, notificar a la CCD
                            </Button>

                            <Dropdown menu={{ items }} placement="bottomLeft" arrow={{ pointAtCenter: true }}>
                                <Button type="text" htmlType="button" className={styles.my_offers__item__cancel}>
                                    Informar de un inciente con esta orden
                                </Button>
                            </Dropdown>
                        </>
                        )}

                        {exchange.status === ExchangeStatus.Done && (
                        <>
                            <div>
                                Deposito verificado: {tipo === 'C' ? `${currencyFormatter(exchange.monto_usd)} USD` : `S/. ${currencyFormatter(exchange.monto_usd * exchange.precio_midmarket)}`}
                            </div>

                            <div>
                                Depositado: {tipo === 'C' ? `S/. ${currencyFormatter(exchange.monto_usd * exchange.precio_midmarket)}`: `${currencyFormatter(exchange.monto_usd)} USD`}
                            </div>

                            <div>
                                  {/* @ts-ignore */}
                                {typeof exchange.bankAccount.id_banco !== "number" ? exchange.bankAccount.id_banco?.nombre_banco : ''} / {exchange.bankAccount.moneda === 'S' ? 'Soles' : 'Dólares'}
                            </div>

                            <div>
                                Cuenta: {exchange.bankAccount.numero_cuenta}
                            </div>

                            <div>
                                CCI: {exchange.bankAccount.cci}
                            </div>

                            <div className={styles.my_offers__item__remaining_time}>
                                ¡Intercambio ejecutado!
                            </div>
                        </>
                        )}
                    </div>

                    <Divider />

                </div>
            ))}
        </div>
    );
}
