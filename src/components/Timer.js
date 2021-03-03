import React, { Component } from "react";
import { Subject, interval } from "rxjs";
import { map, debounceTime, buffer, filter } from "rxjs/operators";
import "./Timer.css";

const interval$ = interval(1000);

const stop$ = new Subject();
const start$ = new Subject();
const wait$ = new Subject();

export default class Timer extends Component {
    state = {
        second: 0,
        minute: 0,
        hour: 0,
    };

    started = false;
    subs = null;

    render() {
        return (
            <div className="timer">
                <p>
                    { this.state.hour < 10 ? `0` : null }
                    { this.state.hour }:{ this.state.minute < 10 ? `0` : null }
                    { this.state.minute }:{ this.state.second < 10 ? `0` : null }
                    { this.state.second }
                </p>
                <div className="timer__controls">
                    <input type="button" value="Start" onClick={ () => { start$.next(); } } />
                    <input type="button" value="Stop" onClick={ () => { stop$.next(); } } />
                    <input type="button" value="Wait" onClick={ () => { wait$.next(); } } />
                    <input type="button" value="Reset" onClick={ () => { stop$.next("Reset"); } } />
                </div>
            </div>
        );
    }
    componentDidMount() {
        start$.subscribe((val) => {
            if (!this.started) {
                this.started = true;
            } else {
                return null;
            }
            this.subs = interval$
                .pipe(
                    map((val) => {
                        return this.state.second === 60 ? 0 : this.state.second + 1;
                    })
                )
                .subscribe((val) => {
                    if (val === 0) {
                        if (this.state.minute === 59) {
                            this.setState({ hour: this.state.hour + 1 });
                            this.setState({ minute: 0 });
                        } else {
                            this.setState({ minute: this.state.minute + 1 });
                        }
                    }
                    this.setState({ second: val });
                });
        });
        stop$.subscribe((val) => {
            if (val === "Reset" && this.subs) {
                this.subs.unsubscribe();
                this.started = false;
                start$.next();
            } else if (this.subs) {
                this.subs.unsubscribe();
                this.started = false;
            }
            this.setState({
                second: 0,
                minute: 0,
                hour: 0,
            });
        });

        wait$
            .asObservable()
            .pipe(buffer(wait$.pipe(debounceTime(300))))
            .pipe(map((click) => click.length))
            .pipe(filter((click) => click === 2))
            .subscribe(() => {
                this.started = false;
                if (this.subs) this.subs.unsubscribe();
            });
    }
}
