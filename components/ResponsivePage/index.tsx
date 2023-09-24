import Cabecera from "../cabecera";
import React, {ReactNode} from "react";
import { Layout } from 'antd';

const { Content } = Layout;

export const ResponsivePage = ({ children, login = false }: { children: ReactNode, login?: boolean }) => {
    return (
        <div className='wrapper'>
            <Layout className="layout">

                <Cabecera login={login} />

                <Content className='layout-content' style={{padding: '0 8px'}}>
                    {children}
                </Content>

            </Layout>
        </div>
    );
}
