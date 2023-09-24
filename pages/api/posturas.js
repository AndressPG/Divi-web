import { directus } from '../../utils/constants'

export default async function Login(req, res) {

    const privateData = await directus.items('POSTURA').readByQuery({ meta: 'total_count' });
    res.status(200).json({
        items: privateData.data,
        total: privateData.meta.total_count,
    })
}