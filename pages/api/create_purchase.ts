import {directus} from "../../utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { set } from 'date-fns';

async function CreatePurchaseApi (req, res) {
    const values = await req.body;
    const user = req.session.user;

    const time = values.time.split(':');

    const expirationTime = set(new Date(), { hours: time[0] ?? 18, minutes: 0, seconds: 0 });

    const body = {
        status: 'ACT',
        tipo: 'C',
        id_banco: values.bank,
        monto_usd: Number(values.amount),
        porcentaje_completado: 0,
        acepta_parciales: values.isPartial ?? false,
        ...(values?.minimumAmount && { desde: values.minimumAmount }),
        ...(values?.increaseAmount && { incrementos: values.increaseAmount }),
        hora_expiracion: expirationTime.toISOString(),
        desactiva_x_precio: values.enableMaxAmount ?? false,
        ...(values?.maxAmount && { precio_desactivacion: values.maxAmount }),
        id_casa_cambio_maker: user.id_casa_cambio,
        user_created: user.id,
        monto_pendiente: Number(values.amount),
    };

    try {
        const postura = await directus.items('POSTURA');
        const newPostura = await postura.createOne(body);
        const socket = res.socket.server.io;

        socket.emit('update-posturas', newPostura);
        res.status(200).json({success: true, newPostura});
    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}

export default withIronSessionApiRoute(CreatePurchaseApi, sessionOptions);
