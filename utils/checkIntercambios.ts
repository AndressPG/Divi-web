import {Postura} from "../types/Postura";
import {Exchange} from "../types/Exchange";
import {directus} from "./constants";

export const checkIntercambiosWithBankAccounts = async (postura: Postura, posturaIntercambios: any[]): Promise<Postura> => {
    const intercambios: Exchange[] = [];

    for (const intercambio of posturaIntercambios) {
        if (intercambio.id_postura.some(posturaIntercambio => posturaIntercambio.POSTURA_id_postura === postura.id_postura)) {
            const exchanges = await Promise.all(
                intercambio.id_intercambio.map(async exchange => {
                    if (exchange.INTERCAMBIO_id_intercambio) {
                        const bankAccountType = postura.tipo === 'C' ? 'S' : 'D';
                        const {data: cuentas} = await directus.items('CUENTA').readByQuery({
                            fields: ['*.*'],
                            filter: {
                                id_casa_cambio: {
                                    // @ts-ignore
                                    id_casa_cambio: exchange.INTERCAMBIO_id_intercambio.id_casa_cambio_taker,
                                },
                                moneda: bankAccountType,
                            },
                        });
                        return {...exchange.INTERCAMBIO_id_intercambio, bankAccount: cuentas[0]}
                    }

                    return {...exchange.INTERCAMBIO_id_intercambio};
                })
            );

            intercambios.push(...exchanges);
        }
    }

    if (intercambios.length) {
        postura.intercambios = intercambios;
    }

    return postura;
};

export const checkIntercambios = (postura: Postura, posturaIntercambios: any[]): Postura => {
    const intercambios: Exchange[] = [];

    for (const intercambio of posturaIntercambios) {
        if (intercambio.id_postura.some(posturaIntercambio => posturaIntercambio.POSTURA_id_postura === postura.id_postura)) {
            const exchanges = intercambio.id_intercambio.map(exchange => {
                    return exchange.INTERCAMBIO_id_intercambio;
                });

            intercambios.push(...exchanges);
        }
    }

    if (intercambios.length) {
        postura.intercambios = intercambios;
    }

    return postura;
};
