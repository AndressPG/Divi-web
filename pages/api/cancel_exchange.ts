import {directus} from "../../utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

async function CancelExchangeApi (req, res) {
    try {
        const { posturaIntercambioId, intercambioId } = await req.body;

        const posturaInstance = await directus.items('POSTURA');
        const intercambioInstance = await directus.items('INTERCAMBIO');
        const posturaIntercambioInstance = await directus.items('POSTURA_INTERCAMBIO');

        // @ts-ignore
        const intercambio = await intercambioInstance.readOne(intercambioId);

        const { data: posturaIntercambio } =  await posturaIntercambioInstance.readByQuery({
            fields: ['*.*'],
            filter: {
                id_intercambio: {
                    INTERCAMBIO_id_intercambio: intercambioId,
                },
            },
        });

        // @ts-ignore
        const posturaId = posturaIntercambio[0].id_postura[0].POSTURA_id_postura;
        const postura = await posturaInstance.readOne(posturaId);

        // @ts-ignore
        await posturaInstance.updateOne(posturaId, { monto_pendiente: postura.monto_pendiente + intercambio.monto_usd });

        // @ts-ignore
        await intercambioInstance.deleteOne(intercambioId);

        // @ts-ignore
        await posturaIntercambioInstance.deleteOne(posturaIntercambioId);

        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}

export default withIronSessionApiRoute(CancelExchangeApi, sessionOptions);
