import {directus} from "../../utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import {add} from "date-fns";

async function ConfirmPurchaseApi (req, res) {
    try {
        const body = await req.body;
        const { posturas, hasPendingAmount, pendingAmount, ...values } = body || {};
        const user = req.session.user;

        const posturaInstance = await directus.items('POSTURA');
        const intercambio = await directus.items('INTERCAMBIO');
        const posturaIntercambio = await directus.items('POSTURA_INTERCAMBIO');
        const midMarketPrice = await directus.items('MID_MARKET_PRICE');
        const { data } = await midMarketPrice.readByQuery({
            limit: -1,
        });

        // @ts-ignore
        const { price } = data[0];

        for (let postura of posturas) {
            const posturaAmount = postura.monto_pendiente;
            const amount = postura.allBudget ? posturaAmount : (posturaAmount - postura.pendingAmount);

            const newIntercambio = await intercambio.createOne({
                id_casa_cambio_taker: user.id_casa_cambio,
                precio_midmarket: price,
                fecha_creacion: new Date(),
                monto_usd: amount,
                status: 'ACT'
            });

            const comision = Math.round(postura.monto_usd / 1000);

            await posturaIntercambio.createOne({
                id_postura: [{POSTURA_id_postura: {id_postura: postura.id_postura}}],
                // @ts-ignore
                id_intercambio: [{INTERCAMBIO_id_intercambio: {id_intercambio: newIntercambio.id_intercambio}}],
                sub_monto_usd: amount,
                comision_PEN: comision,
            });

            let percentageComplete = '0';

            if (postura.allBudget) {
                percentageComplete = Number(100).toFixed(2).toString();
            } else {
                const percentage = (100 * amount) / postura.monto_usd;
                percentageComplete = Number(percentage).toFixed(2).toString();
            }

            await posturaInstance.updateOne(postura.id_postura, { porcentaje_completado: percentageComplete, monto_pendiente: postura.allBudget ? 0 : (posturaAmount - amount), ...(postura.allBudget && { status: 'SBY' }) });
        }

        if (hasPendingAmount) {
            const expirationTime = add(new Date(), { hours: values.time ?? 18 });

            const body = {
                status: 'ACT',
                tipo: 'C',
                id_banco: 1,
                monto_usd: Number(pendingAmount),
                porcentaje_completado: 0,
                acepta_parciales: true,
                ...(values?.minimumAmount && { desde: values.minimumAmount }),
                ...(values?.increaseAmount && { incrementos: values.increaseAmount }),
                hora_expiracion: expirationTime.toISOString(),
                desactiva_x_precio: values.enableMaxAmount ?? false,
                ...(values?.maxAmount && { precio_desactivacion: values.maxAmount }),
                id_casa_cambio_maker: user.id_casa_cambio,
                user_created: user.id,
                monto_pendiente: Number(pendingAmount),
            };

            const newPostura = await posturaInstance.createOne(body);
            const socket = res.socket.server.io;

            socket.emit('update-posturas', newPostura);
        }

        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}

export default withIronSessionApiRoute(ConfirmPurchaseApi, sessionOptions);
