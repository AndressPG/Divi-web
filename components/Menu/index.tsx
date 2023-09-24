import styles from '../../styles/components/menu/menu.module.scss';
import {Button, Col, Dropdown, MenuProps, Row} from "antd";
import { MenuOutlined } from '@ant-design/icons';
import Link from "next/link";

export const Menu = () => {
    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <Link href='/perfil'>
                    Perfil
                </Link>
            )
        },

        {
            key: '2',
            label: (
                <Link href='/api/logout'>
                    Cerrar Sesion
                </Link>
            )
        }
    ];

    return (
    <>
        <Row className={styles.menu} justify='space-evenly' align='middle'>

            <Col span={4}>
                <Link href='/trading'>
                    <span className={styles.item}>Trades</span>
                </Link>
            </Col>

            <Col span={6}>
                <Link href='/mis-posturas'>
                    <span className={styles.item}>Mis Posturas</span>
                </Link>
            </Col>

            <Col span={6}>
                <Link href='/mis-intercambios'>
                    <span className={styles.item}>Mis Intercambios</span>
                </Link>
            </Col>

            <Col span={6 }>
                <Link href='/mis-operaciones'>
                    <span className={styles.item}>Mis Operaciones</span>
                </Link>
            </Col>

            <Col span={2}>
                <Dropdown menu={{ items }} placement='bottom'>
                    <Button type='text' icon={<MenuOutlined />} />
                </Dropdown>
            </Col>
        </Row>
    </>
    );
};
