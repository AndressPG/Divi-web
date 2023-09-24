import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { directus } from "../../utils/constants";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute (req, res) {
    const { email } = await req.body;
    const { clave } = await req.body;
    let authenticated = false;

    // Try to authenticate with token if exists
    await directus.auth
        .refresh()
        .then(() => {
            authenticated = true;
        })
        .catch(() => {});

    // Let's login in case we don't have token or it is invalid / expired
    if (!authenticated) {
        await directus.auth
            .login( {email:email, password:clave} )
            .then(() => {
                authenticated = true;
            })
            .catch(() => {
                console.log('Invalid credentials');
                res.status(410).json(
                    { message: '¡Credenciales invalidas!' }
                )
            });
    }

    // After authentication, we can fetch the private data in case the user has access to it, save session cookies and send response
    if(authenticated){
        const me = await directus.users.me.read();
        const user = { ...me,  isLoggedIn: true };
        req.session.user = user;
        await req.session.save();
        res.status(200).json(user);
    }
}
