import React, { useCallback, useEffect, useState } from "react";
import { Subject, interval } from "rxjs";
import { map, debounceTime, buffer, filter } from "rxjs/operators";
import "./Timer.css";

const interval$ = interval(1000);

const stop$ = new Subject();
const start$ = new Subject();
const wait$ = new Subject();
const reset$ = new Subject();

const DEFAULT_TIMER = {
    second: 0,
    minute: 0,
    hour: 0,
}
export default function Timer() {
    const [timer, setTimer] = useState(DEFAULT_TIMER)


    const addSecond = useCallback(() => {
        setTimer((timer) => {
            if (timer.second + 1 === 60) {
                if (timer.minute + 1 === 60) {
                    return { second: 0, minute: 0, hour: timer.hour + 1 }
                } else {
                    return { ...timer, second: 0, minute: timer.minute + 1 }
                }
            }
            return { ...timer, second: timer.second + 1 }
        })
    }, [])

    useEffect(() => {
        let subscription;
        start$.subscribe(() => {
            subscription = interval$.subscribe(addSecond);
        })
        stop$.subscribe(() => {
            subscription.unsubscribe()
            setTimer(DEFAULT_TIMER);
        })
        reset$.subscribe(() => {
            setTimer(DEFAULT_TIMER);
        })
        wait$
            .asObservable()
            .pipe(buffer(wait$.pipe(debounceTime(250))))
            .pipe(map((click) => click.length))
            .pipe(filter((click) => click === 2))
            .subscribe(() => {
                subscription.unsubscribe(addSecond)
            });
    }, [addSecond])


    return (
        <div className="timer">
            <p>
                { timer.hour < 10 ? `0` : null }
                { timer.hour }:{ timer.minute < 10 ? `0` : null }
                { timer.minute }:{ timer.second < 10 ? `0` : null }
                { timer.second }
            </p>
            <div className="timer__controls">
                <input type="button" value="Start" onClick={ () => { start$.next(); } } />
                <input type="button" value="Stop" onClick={ () => { stop$.next(); } } />
                <input type="button" value="Wait" onClick={ () => { wait$.next(); } } />
                <input type="button" value="Reset" onClick={ () => { reset$.next(); } } />
            </div>
        </div>
    );
}

