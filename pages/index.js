import styles from "../styles/pages/login/login.module.scss";

import React, {useCallback, useEffect, useState} from "react";
import {Form, Input, Button, Layout} from 'antd';
import Cabecera from '../components/cabecera';
import Footer from '../components/footer';
import useUser from "../lib/useUser";
import fetchJson, {FetchError} from "../lib/fetchJson";
import {useDispatch} from "react-redux";
import {setAuthState} from "../store/reducers/auth.reducer";
import {wrapper} from "../store/store";
import {directus} from "../utils/constants";
import {setPosturas} from "../store/reducers/postura.reducer";


const {Content} = Layout;

export default function Index() {
    // here we just check if user is already logged in and redirect to profile
    const {mutateUser} = useUser({
        redirectTo: "/trading",
        redirectIfFound: true,
    });
    const [message, setMsgNError] = useState({msg: '', error: false});
    const dispatch = useDispatch();

    async function handleSubmit(values) {
        try {
            const user = await fetchJson('/api/login_api', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: values.email,
                    clave: values.clave
                }),
            });
            mutateUser(user);
            dispatch(setAuthState(user))

        } catch (error) {
            if (error instanceof FetchError) {
                setMsgNError({msg: error.data.message, error: true});
                console.log(error.data.message);
            } else {
                console.error("An unexpected error happened:", error);
            }
        }
    }

    return (
        <div className='wrapper'>
            <Layout className="layout">
                <Cabecera login />

                <Content className='layout-content' style={{padding: '0 16px'}}>
                    <h1 className={styles.title}>Login</h1>
                    
                    <Form
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={handleSubmit}
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: '¡Por favor ingrese su email!',
                                },
                            ]}
                            label="Usuario"
                        >
                            <Input id="email" name="email" placeholder="email"/>
                        </Form.Item>

                        <Form.Item
                            name="clave"
                            rules={[
                                {
                                    required: true,
                                    message: '¡Por favor ingrese su clave de acceso!',
                                },
                            ]}
                            label="Clave"
                        >
                            <Input id="clave" name="clave" type="password" placeholder="clave"/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="text" htmlType="submit" className={styles.submit}>
                                Ingresar
                            </Button>
                        </Form.Item>

                        {/*<a className={styles.forgotPassword}>Recuperar contraseña!</a>*/}
                    </Form>
                    <div className={message.error ? 'error' : 'mensaje'}>{message.msg}</div>
                </Content>
                <Footer/>
            </Layout>
        </div>
    )
}
