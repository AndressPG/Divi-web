import styles from '../../styles/components/Offers/offers-table.module.scss';
import {useSelector} from "react-redux";
import {selectAuthState} from "../../store/reducers/auth.reducer";
import {PossiblePostura, Postura} from "../../types/Postura";

export const OffersTable = ({ posturas }: { posturas: Postura[] | PossiblePostura[] }) => {

    const { id_casa_cambio } = useSelector(selectAuthState);
    let total = 0;

    return (
        <>
        <div className={styles.offers_table}>
            {posturas.length > 0 && posturas.map(postura => {

                const amount = postura.monto_pendiente;
                total = total + amount;

                return (
                    <div className={styles.offers_table__items} key={postura.id_postura}>
                        {postura.acepta_parciales ? (

                            <span className={styles.offers_table__partial}>PAR</span>

                        ) : (

                            <span style={{ width: '18px' }}></span>

                        )}

                        <span className={`${styles.offers_table__amount} ${id_casa_cambio === postura.id_casa_cambio_maker && styles.offers_table__mine}`}>
                            {amount}
                        </span>

                        <span className={styles.offers_table__total}>
                            {total}
                        </span>

                    </div>
                );
            })}
        </div>

        <div className={styles.offers_table__separator} />

        <p className={styles.offers_table__sum}>{total}</p>
        </>
    );
}
