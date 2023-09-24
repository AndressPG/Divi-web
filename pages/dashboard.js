import { Layout, Breadcrumb } from 'antd';
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "../lib/session";
import Cabecera from '../components/cabecera';
import Footer from '../components/footer';
import { directus } from "../utils/constants";

const { Content } = Layout;

export default function Dashboard(props) {
    console.log(props);
    return (
        <div className='wrapper'>
        <Layout className="layout">
            <Cabecera login/>
            <Content style={{ padding: '0 50px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Login</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-content">
                Dashboard!
            </div>
            </Content>
            <Footer />
        </Layout>
        </div>
    )
}

export const getServerSideProps = withIronSessionSsr(async function ({ req, res }) {
    const user = req.session.user;

    if (user === undefined) {
      res.setHeader("location", "/login");
      res.statusCode = 302;
      res.end();
      return {
        props: {
          user: { isLoggedIn: false, login: "", avatarUrl: "" },
        },
      };
    }

    await directus.auth.login( {email:user.email, password:user.clave} )
    const privateData = await directus.items('POSTURA').readByQuery({ meta: 'total_count' });
    return {
        props: privateData
      }
  },
  sessionOptions);
