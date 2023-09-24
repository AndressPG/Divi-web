import styles from '../../styles/pages/my-offers/my-offers.module.scss';

import {ResponsivePage} from "../../components/ResponsivePage";
import {AssociatedExchanges} from "../../components/AssociatedExchanges/AssociatedExchanges";
import {directus} from "../../utils/constants";
import {checkIntercambiosWithBankAccounts} from "../../utils/checkIntercambios";
import {Postura} from "../../types/Postura";
import {Exchange, ExchangeStatus} from "../../types/Exchange";
import {format} from "date-fns";
import {currencyFormatter} from "../../utils/formatter";

const DetallePostura = ({ postura }: { postura: Postura }) => {
    const getExchangesTotalByStatus = (status: ExchangeStatus, exchanges?: Exchange[]): number => {
        if (!exchanges) {
            return 0;
        }

        return exchanges.reduce<number>((acc, exchange) => {
            if (exchange.status === status) {
                return acc + exchange.monto_usd;
            }

            return acc;
        }, 0);
    };

    return (
        <ResponsivePage>
            <div className={styles.my_offers}>
                <div className={styles.my_offers__info}>
                    <div>
                        Monto: <b>{currencyFormatter(postura.monto_usd)} USD</b>
                    </div>
                    <div>
                        Por atender: {currencyFormatter(getExchangesTotalByStatus(ExchangeStatus.Active, postura.intercambios))} USD
                    </div>
                    <div>
                        En proceso: {currencyFormatter(getExchangesTotalByStatus(ExchangeStatus.StandBy, postura.intercambios))} USD
                    </div>
                    <div>
                        {postura.tipo === 'C' ? 'Comprados' : 'Vendidos'}: {currencyFormatter(getExchangesTotalByStatus(ExchangeStatus.Done, postura.intercambios))} USD
                    </div>
                    <div>
                        Creada: {format(new Date(postura.date_created), 'hh:mmaaa dd/MM/yyyy')}
                    </div>
                    <div>
                        {/* @ts-ignore */}
                        {typeof postura.bankAccount.id_banco !== "number" ? postura.bankAccount.id_banco?.nombre_banco : ''} / {postura.bankAccount.moneda === 'S' ? 'Soles' : 'Dólares'}
                    </div>
                    <div>
                        Cuenta: {postura.bankAccount.numero_cuenta}
                    </div>
                    <div>
                        CCI: {postura.bankAccount.cci}
                    </div>
                </div>
                <AssociatedExchanges exchanges={postura.intercambios} tipo={postura.tipo} />
            </div>
        </ResponsivePage>
    );
};

export async function getServerSideProps({ query }) {
    const { id } = query;

    const postura = await directus.items('POSTURA').readOne(id);

    const { data: posturaIntercambio } = await directus.items('POSTURA_INTERCAMBIO').readByQuery({
        limit: -1,
        fields: ['*', 'id_postura.POSTURA_id_postura', 'id_intercambio.INTERCAMBIO_id_intercambio.*']
    });
    const posturaWithExchanges = await checkIntercambiosWithBankAccounts(postura as Postura, posturaIntercambio);

    // @ts-ignore
    const bankAccountType = postura.tipo === 'C' ? 'D' : 'S';

    const {data: cuentas} = await directus.items('CUENTA').readByQuery({
        fields: ['*.*'],
        filter: {
            id_casa_cambio: {
                // @ts-ignore
                id_casa_cambio: posturaWithExchanges.id_casa_cambio_maker,
            },
            moneda: bankAccountType,
        },
    });

    return { props: { postura: { ...posturaWithExchanges, bankAccount: cuentas[0] } } };
}

export default DetallePostura;
