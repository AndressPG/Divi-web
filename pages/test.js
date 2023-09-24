import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import Cabecera from '../components/cabecera';
import Footer from '../components/footer';
import { directus } from '../utils/constants'

const { Content } = Layout;

export default function Home(props) {
  return (
    <div className='wrapper'>
      <Layout className="layout">
        <Cabecera home/>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-content">
            <div dangerouslySetInnerHTML={{__html: props.Intro}} />
          </div>
        </Content>
          <Footer />
      </Layout>
    </div>
  )
}

export async function getStaticProps() {
  // Get external data from the file system, API, DB, etc.
  const  home = await directus.items('Intro_Home').readByQuery();

  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: home.data
  }
}
