import {directus} from "../../utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

async function ConfirmDepositTakerApi (req, res) {
    try {
        const { posturaIntercambioId, intercambioId } = await req.body;

        const intercambioInstance = await directus.items('INTERCAMBIO');
        const posturaIntercambioInstance = await directus.items('POSTURA_INTERCAMBIO');

        // @ts-ignore
        const posturaIntercambio = await posturaIntercambioInstance.updateOne(posturaIntercambioId, { fecha_deposito_taker: new Date().toISOString() });

        // @ts-ignore
        await intercambioInstance.updateOne(intercambioId, { status: 'STB' });
        res.status(200).json({success: true, posturaIntercambio});

    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}

export default withIronSessionApiRoute(ConfirmDepositTakerApi, sessionOptions);
