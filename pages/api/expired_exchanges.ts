import {directus} from "../../utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

async function ConfirmBuyApi (req, res) {
    try {
        const userExchangeHouseId = req.session.user.id_casa_cambio;

        const intercambioInstance = await directus.items('INTERCAMBIO');

        const { data: intercambios } = await intercambioInstance.readByQuery({
            limit: -1,
            filter: {
                id_casa_cambio_taker: userExchangeHouseId,
            },
        });

        // @ts-ignore
        const intercambioIds = intercambios.map(intercambio => intercambio.id_intercambio);

        // @ts-ignore
        await intercambioInstance.updateMany(intercambioIds, { status: 'EXP' });
        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}

export default withIronSessionApiRoute(ConfirmBuyApi, sessionOptions);
