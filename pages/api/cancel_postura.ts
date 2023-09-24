import {directus} from "../../utils/constants";

export default async function CancelPostura(req, res) {
    try {
        const { posturaId } = await req.body;
        const posturaInstance = await directus.items('POSTURA');
        await posturaInstance.updateOne(posturaId, { status: 'CAN' });

        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        res.status(400).json({success: false});
    }
}
