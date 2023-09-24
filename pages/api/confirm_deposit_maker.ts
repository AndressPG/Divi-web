import {directus} from "../../utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import cancel_exchange from "./cancel_exchange";
import {ExchangeStatus} from "../../types/Exchange";

async function ConfirmDepositMakerApi (req, res) {
    try {
        const { intercambioId } = await req.body;

        const intercambioInstance = await directus.items('INTERCAMBIO');
        const posturaIntercambioInstance = await directus.items('POSTURA_INTERCAMBIO');

        await intercambioInstance.updateOne(intercambioId, { status: 'DON' });

        // @ts-ignore
        const { data: posturaIntercambio } =  await posturaIntercambioInstance.readByQuery({
            fields: ['*.*'],
            filter: {
                id_intercambio: {
                    INTERCAMBIO_id_intercambio: intercambioId,
                },
            },
        });

        // @ts-ignore
        await posturaIntercambioInstance.updateOne(posturaIntercambio[0].id_postura_intercambio, { fecha_deposito_maker: new Date().toISOString() });

        // @ts-ignore
        const posturaId = posturaIntercambio[0].id_postura[0].POSTURA_id_postura;

        const { data: intercambios } =  await posturaIntercambioInstance.readByQuery({
            fields: ['*.*', 'id_intercambio.INTERCAMBIO_id_intercambio.*'],
            filter: {
                id_postura: {
                    POSTURA_id_postura: posturaId,
                },
            },
        });

        // @ts-ignore
        const allExchangesAreDone = intercambios.every(exchange => exchange.id_intercambio[0].INTERCAMBIO_id_intercambio.status === ExchangeStatus.Done);
        const posturaInstance = await directus.items('POSTURA');
        const postura = await posturaInstance.readOne(posturaId);

        // @ts-ignore
        if (allExchangesAreDone && postura.monto_pendiente === 0) {
            await posturaInstance.updateOne(posturaId, { status: 'CER' });
        }

        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}

export default withIronSessionApiRoute(ConfirmDepositMakerApi, sessionOptions);
