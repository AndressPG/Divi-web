import styles from "../styles/components/cabecera/cabecera.module.scss";

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col } from 'antd';
import { Menu } from "./Menu";

const { Header } = Layout;

const Cabecera = ({ login = false }: { login?: boolean }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString();
    const formattedDate = currentTime.toLocaleDateString();

    return (
    <>
        <Header className={styles.navbar}>
            <Row align="middle">
                <Col span={8} className={styles.leftContent}>
                    <div className={styles.platformName}>DiVi Application</div>
                </Col>

                <Col span={8} className={styles.centerContent}>
                    <div className={styles.clock}>
                        <span>{formattedTime}</span>
                        <span>{formattedDate}</span>
                    </div>
                </Col>
            </Row>
        </Header>

        {!login && (
        <Menu />
        )}
    </>
    );
}

export default Cabecera;
