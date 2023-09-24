import styles from '../styles/pages/create-offer/create-offer.module.scss';

import {ResponsivePage} from "../components/ResponsivePage";
import {Checkbox, Button, Form, InputNumber, TimePicker} from "antd";
import React, { useState} from "react";
import { useRouter } from 'next/router';
import fetchJson from "../lib/fetchJson";
import {PossiblePostura} from "../types/Postura";
import {useSelector} from "react-redux";
import {selectPosturaState} from "../store/reducers/postura.reducer";
import {directus} from "../utils/constants";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';

dayjs.extend(customParseFormat);

const CrearCompra = ({ midMarketPrice }: { midMarketPrice: number }) => {
    const router = useRouter();
    const { amountToBuy, ventas } = useSelector(selectPosturaState);
    const [enablePartial, setEnablePartial] = useState(true);
    const [enableTime, setEnableTime] = useState(true);
    const [enableMaxAmount, setEnableMaxAmount] = useState(false);
    const [time, setTime] = useState('18:00');

    const goToMyOffers = () => {
        router.push('/trading');
    };

    const checkPosturas = async (values: any) => {
        let budget = 0;
        let pendingAmount = 0;
        let hasPendingAmount = false;

        const possiblePosturas = ventas.filter(venta => {
            if (venta.acepta_parciales && amountToBuy % venta.incrementos === 0) {
                return true;
            }

            return venta.monto_usd <= amountToBuy
        })
            .map(postura => {
                const previousBudget = budget;

                if (budget >= amountToBuy) {
                    return;
                }

                if (!postura.acepta_parciales && budget + postura.monto_usd <= amountToBuy - budget) {
                    budget = budget + postura.monto_usd;
                    return { ...postura, allBudget: true, pendingAmount: 0 };
                }
                const amount = postura.monto_pendiente;

                if (postura.acepta_parciales && amountToBuy >= postura.desde && amountToBuy - budget >= amount) {
                    budget = budget + amount;
                    return { ...postura, allBudget: true, pendingAmount: 0};
                }

                if (postura.acepta_parciales && amountToBuy - budget <= amount && amountToBuy >= postura.desde && amountToBuy % postura.incrementos === 0) {
                    budget = budget + (amountToBuy - budget);
                    return { ...postura, allBudget: false, pendingAmount: (amount - (amountToBuy - previousBudget)) };
                }

                return;
            })
            .filter (postura => postura);

        if (!possiblePosturas.length) {
            await createPurchase(values);
            return;
        }

        if (budget < amountToBuy) {
            hasPendingAmount = true;
            pendingAmount = amountToBuy - budget;
        }

        if ((!hasPendingAmount && pendingAmount === 0) || (hasPendingAmount && pendingAmount > 0 && values.isPartial)) {
            await confirmPurchase(values, possiblePosturas, hasPendingAmount, pendingAmount);
            return;
        }

        if (!values.isPartial) {
            await createPurchase(values);
            return;
        }
    };

    const confirmPurchase = async (values: any, posturas: PossiblePostura[], hasPendingAmount: boolean, pendingAmount: number) => {
        try {
            const response = await fetchJson('/api/confirm_purchase', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ ...values, posturas, hasPendingAmount, pendingAmount, time }),
            });

            if (response.success) {
                router.push('/mis-intercambios');
            }
        } catch (e) {
            console.log(e);
        }
    };

    const createPurchase = async (values: any) => {
        try {
            const response = await fetchJson('/api/create_purchase', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ ...values, time }),
            });

            if (response.success) {
                router.push('/mis-posturas');
            }
        } catch (e) {
            console.log(e);
        }

    };

    return (
        <ResponsivePage>
            <div className={styles.offer}>
                <h1 className={styles.offer__title}>Crear postura de compra</h1>
                <h2 className={styles.offer__subtitle}>Precio Mid Market</h2>
                <h1 className={styles.offer__mid_point}>{midMarketPrice}</h1>
                <Form name='createOffer' onFinish={checkPosturas} layout='vertical' initialValues={{ amount: amountToBuy, maxAmount: (midMarketPrice + 0.01).toFixed(4), isPartial: enablePartial, minimumAmount: 1000, increaseAmount: 1000, enableTime }}>
                    
                    <Form.Item name="amount" rules={[{ required: true, message: 'El monto es requerido' }]}>
                        <InputNumber className={styles.offer__amount}
                                        id="amount"
                                        name="amount"
                                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')} 
                                        placeholder="Monto USD"
                                        min={1} />
                    </Form.Item>

                    <Form.Item name="isPartial" valuePropName="checked">
                        <Checkbox checked={enablePartial} onChange={e => setEnablePartial(e.target.checked)}>Acepta ordenes parciales</Checkbox>
                    </Form.Item>

                    <div className={styles.offer__minimum_amount}>
                        <label>Orden Mínima</label>

                        <Form.Item name='minimumAmount' className={styles.offer__minimum_amount__wrap}>
                            <InputNumber id="minimumAmount"
                                            name="minimumAmount"
                                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                                            placeholder="Monto minimo USD"
                                            min={1}
                                            disabled={!enablePartial} />
                        </Form.Item>
                    </div>

                    <div className={styles.offer__minimum_amount}>
                        <label>Incremento</label>

                        <Form.Item name="increaseAmount" className={styles.offer__minimum_amount__wrap}>
                            <InputNumber id="increaseAmount"
                                            name="increaseAmount"
                                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                                            placeholder="En incrementos de 1,000USD"
                                            min={1}
                                            disabled={!enablePartial} />
                        </Form.Item>
                    </div>

                    <Form.Item name="enableMaxAmount" valuePropName="checked">
                        <Checkbox onChange={e => setEnableMaxAmount(e.target.checked)}>
                            Desactivar cuando el precio llegue a:
                        </Checkbox>
                    </Form.Item>

                    <Form.Item name="maxAmount">
                        <InputNumber className={styles.offer__max_amount}
                                        id="maxAmount"
                                        name="maxAmount"
                                        formatter={(value) => `S/. ${value}`.replace(/\B(?=(\d{3)+(?!\d))/g, ',')}
                                        parser={(value: any) => value!.replace(/\$\\s?|(,*)/g, '')}
                                        placeholder="3.795"
                                        disabled={!enableMaxAmount}/>
                    </Form.Item>

                    <Form.Item name="enableTime" valuePropName='checked'>
                        <Checkbox checked={enableTime} onChange={e => setEnableTime(e.target.checked)}>
                            Eliminar a esta hora del día:
                        </Checkbox>
                    </Form.Item>

                    <Form.Item name="time">
                        <div className={styles.offer__time}>
                            {/* @ts-ignore */}
                            <TimePicker id="time" name="time" disabled={!enableTime} defaultValue={dayjs('18:00', 'HH:mm')} format='HH:mm' onChange={(_time: Dayjs, timeString: string) => setTime(timeString)} showMinute={false} />

                            <span>Horas</span>
                        </div>
                    </Form.Item>

                    <div className={styles.offer__buttons}>
                        <Form.Item>
                            <Button type="text" htmlType='submit' className={styles.offer__create}>
                                Crear Compra
                            </Button>
                        </Form.Item>

                        <Button type="text" className={styles.offer__cancel} onClick={goToMyOffers}>
                            Cancelar
                        </Button>
                    </div>
                </Form>
            </div>
        </ResponsivePage>
    );
}

export async function getServerSideProps() {
    const { data } = await directus.items('MID_MARKET_PRICE').readByQuery({
        limit: -1,
    });

    // @ts-ignore
    const { price } = data[0];

    return { props: { midMarketPrice: price } };
}

export default CrearCompra;
