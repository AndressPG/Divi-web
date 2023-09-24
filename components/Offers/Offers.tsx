import styles from '../../styles/components/Offers/offers.module.scss';
import {Button, InputNumber} from "antd";
import React, {useState} from "react";
import {OffersTable} from "./OffersTable";
import { useRouter } from 'next/router';
import {useDispatch, useSelector} from "react-redux";
import {selectPosturaState, setAmountToBuy, setAmountToSell} from "../../store/reducers/postura.reducer";
import fetchJson from "../../lib/fetchJson";
import {PossiblePostura} from "../../types/Postura";

export const Offers = () => {

    const router = useRouter();
    const dispatch = useDispatch();
    const { compras, ventas } = useSelector(selectPosturaState);
    const [amountToBuy, setAmountToBuyState] = useState(0);
    const [amountToSell, setAmountToSellState] = useState(0);
    const [showPurchaseAmountRequired, setShowPurchaseAmountRequired] = useState(false);
    const [showSaleAmountRequired, setShowSaleAmountRequired] = useState(false);

    const goToCreateSale = () => {
        if (amountToSell) {
            dispatch(setAmountToSell(amountToSell));
            router.push('/crear-venta');
        } else {
            setShowSaleAmountRequired(true);
        }
    };

    const goToCreatePurchase = () => {
        if (amountToBuy) {
            dispatch(setAmountToBuy(amountToBuy));
            router.push('/crear-compra');
        } else {
            setShowPurchaseAmountRequired(true);
        }
    };

    const buyAll = async () => {
        const posturas = ventas.map<PossiblePostura>(venta => ({ ...venta, allBudget: true, pendingAmount: 0 }));
        try {
            if (!posturas.length) {
                return;
            }

            const response = await fetchJson('/api/confirm_purchase', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ posturas, hasPendingAmount: false, pendingAmount: 0 }),
            });

            if (response.success) {
                router.push('/mis-intercambios');
            }

        } catch (e) {
            console.log(e);
        }
    };

    const sellAll = async () => {
        const posturas = compras.map<PossiblePostura>(venta => ({ ...venta, allBudget: true, pendingAmount: 0 }));
        try {
            const response = await fetchJson('/api/confirm_sale', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ posturas, hasPendingAmount: false, pendingAmount: 0 }),
            });

            if (response.success) {
                router.push('/mis-intercambios');
            }

        } catch (e) {
            console.log(e);
        }
    };

    const handleOnChangePurchaseAmount = (value: number) => {
        setAmountToBuyState(value);
        setShowPurchaseAmountRequired(false);
    }

    const handleOnChangeSaleAmount = (value: number) => {
        setAmountToSellState(value);
        setShowSaleAmountRequired(false);
    }

    return (
        <>
        <div className={styles.offers}>

            <div className={styles.offers__table_wrapper}>
                <h1 className={styles.offers__title}>Vendiendo USD</h1>
                <h1 className={styles.offers__title}>Comprando USD</h1>
            </div>

            <div className={styles.offers__table_wrapper}>
                <OffersTable posturas={ventas} />
                <OffersTable posturas={compras} />
            </div>

            <div className={styles.offers__table_wrapper}>
                <Button type="text" className={styles.offers__button} onClick={buyAll}>
                    Comprar Todo
                </Button>

                <Button type="text" className={styles.offers__button} onClick={sellAll}>
                    Vender Todo
                </Button>
            </div>

            <div>
                <Button type="text" className={styles.offers__button} onClick={buyAll}>
                    Comprar Todo
                </Button>

                <p className={styles.offers__o_label}>O</p>

                <InputNumber className={styles.offers__amount}
                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Monto a comprar"
                            min={1}
                            onChange={value => handleOnChangePurchaseAmount(Number(value))}
                            />

                    {showPurchaseAmountRequired && (
                        <span className={styles.error}>El monto a comprar es requerido</span>
                    )}

                <Button type="text" className={styles.offers__button} onClick={goToCreatePurchase}>
                    Comprar
                </Button>

            </div>

            <div>

                <Button type="text" className={styles.offers__button} onClick={sellAll}>
                    Vender Todo
                </Button>

                <p className={styles.offers__o_label}>O</p>

                <InputNumber className={styles.offers__amount}
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Monto a vender"
                    min={1}
                    onChange={value => handleOnChangeSaleAmount(Number(value))}
                />

                {showSaleAmountRequired && (
                    <span className={styles.error}>El monto a vender es requerido</span>
                )}

                <Button type="text" className={styles.offers__button} onClick={goToCreateSale}>
                    Vender
                </Button>
            </div>

        </div>
        </>
    );
}
