import styles from "../../styles/components/AssociatedExchanges/AssociatedExchanges.module.scss";
import {useEffect, useState} from "react";
import {addMinutes} from "date-fns";

export const TimerExchange = ({ date }: { date: string }) => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(async () => {

            const deadline = addMinutes(new Date(date), 10);
            const now = new Date().getTime();
            const time = new Date(deadline).getTime() - now;
            const minutesToExpired = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            const secondsToExpired = Math.floor((time % (1000 * 60)) / 1000);
            setMinutes(minutesToExpired);
            setSeconds(secondsToExpired);

            if (time < 0) {
                clearInterval(interval);
            }

        }, 1000);

        return () => clearInterval(interval);

    }, []);

    return (
        <div className={styles.my_offers__item__remaining_time}>
            Tienen {minutes}:{seconds} mins para ejecutar el deposito
        </div>
    );
}
