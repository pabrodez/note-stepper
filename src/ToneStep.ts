// TODO fix start audio context by user

import * as Tone from 'tone';
import { createElement } from "./helper";

export default class ToneStep {
    // static properties
    private static readonly defaultNotes: string[] = [
        'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
        'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'
    ]
    // static methods
    private static createMatrix(cols: number, rows: number, fill: number = 0): number[][] {
        let matrix: number[][] = []
        for (let i = 0; i < cols; i++) {
            matrix.push(Array(rows).fill(fill))
        }
        return matrix
    }

    // instance properties and methods
    private contextStarted: boolean
    private instrument: any
    private userNotes: string[]
    private readonly nrows: number
    private readonly ncols: number
    private matrix: number[][]
    private currentColumn: number
    ui: HTMLElement

    constructor(ncols: number = ToneStep.defaultNotes.length, nrows: number = ToneStep.defaultNotes.length, notes: string[] = ToneStep.defaultNotes) {

        this.contextStarted = false
        this.instrument = this.createSampleInstrument()
        this.userNotes = notes
        this.ncols = ncols
        this.nrows = nrows
        this.matrix = ToneStep.createMatrix(this.ncols, this.nrows, 0)
        this.currentColumn = 0
        this.ui = this.createUi()
    }

    private createSynth(): Tone.PolySynth<Tone.Synth<Tone.SynthOptions>> {
        let synth = new Tone.PolySynth(Tone.Synth).toDestination()
        const pDelay = new Tone.PingPongDelay()
        synth.connect(pDelay)
        synth.set({
            envelope: {
                "attack": 0.1,
                "decay": 0.5,
                "sustain": 0.4,
                "release": 0.1,
            },
            oscillator: {
                type: 'triangle',
            }
        })

        return synth
    }

    private createSampleInstrument(): Tone.Sampler | Tone.PolySynth<Tone.Synth<Tone.SynthOptions>> {
        // let sampler = new Tone.Sampler(            
        //     {
        //     urls: {
        //         A2: "./A2.mp3",
        //         B2: "./B2.mp3",
        //         C2: "./C2.mp3",
        //         D2: "./D2.mp3",
        //         E2: "./E2.mp3",
        //         F2: "./F2.mp3",
        //         G2: "./G2.mp3",
        //         A3: "./A3.mp3",
        //         B3: "./B3.mp3",
        //         C3: "./C3.mp3",
        //         D3: "./D3.mp3",
        //         E3: "./E3.mp3",
        //         F3: "./F3.mp3",
        //         G3: "./G3.mp3",
        //     }
        // }).toDestination();
        let sampler = new Tone.PolySynth(Tone.Synth).toDestination();
        const pDelay = new Tone.PingPongDelay()
        sampler.connect(pDelay)
        // let sampler = new Tone.Sampler({
        //     urls: {
        //         A1: "A1.mp3",
        //         A2: "A2.mp3",
        //     },
        //     attack: 0.9,
        //     release: 0.1,
        //     baseUrl: "https://tonejs.github.io/audio/casio/",
        // }).toDestination();


        return sampler
    }

    private randomizeInstAttr(): void {
        // const oscillator: string = ['sine', 'triangle', 'pwm'][Math.floor(Math.random() * 2)]
        this.instrument.set({
            "attack": Math.random(),
            "release": Math.random(),
        })
    }

    private createResetButton(): HTMLElement {
        let button = createElement('button', {
            'type': 'button',
            'className': 'menuInput',
            'id': 'randomize',
            'onpointerdown': (e: Event) => this.resetNotes()
        })
        button.textContent = '🔥'

        return button
    }

    private resetNotes(): void {
        this.matrix.map(col => col.fill(0))
        document.querySelectorAll('.noteCell.active').forEach(cell => cell.classList.remove('active'))
    }

    private createRandomButton(): HTMLElement {
        let button = createElement('button', {
            'type': 'button',
            'className': 'menuInput',
            'id': 'randomize',
            'onpointerdown': (e: Event) => this.randomizeInstAttr(),
        })
        button.textContent = '🔀'

        return button
    }

    public startScheduleRepeat(): void {
        Tone.Transport.bpm.value = 110
        Tone.Transport.scheduleRepeat((time) => {
            this.playNextNotes(time)
        }, '8n')
    }

    private playNextNotes(time: number): void {
        this.toggleHighlightColumn()
        const stepNotes: string[] = this.getColumnNotes()
        this.instrument.triggerAttackRelease(stepNotes, "8n", time)
        this.advanceColumn()
    }

    private getColumnNotes(): string[] {
        const columnNotes: string[] = this.matrix[this.currentColumn].reduce((acc, row, ind) => {
            if (row) {
                acc.push(this.userNotes[ind])
            }
            return acc
        }, []);
        return columnNotes;
    }

    private advanceColumn(): void {
        this.currentColumn = this.currentColumn + 1 < this.ncols ? this.currentColumn + 1 : 0
    }

    private toggleHighlightColumn() {
        // removes the highlight class from the previous column and adds it to the current one
        document
            .querySelector(`#columnsWrapper article:nth-child(${this.currentColumn === 0 ? this.ncols : this.currentColumn})`)
            .classList.remove('highlighted')
        document
            .querySelector(`#columnsWrapper article:nth-child(${this.currentColumn + 1})`)
            .classList.add('highlighted')
    }

    public async startAudioContext(): Promise<void> {
        // await Tone.loaded()
        await Tone.start()
        this.contextStarted = true
        console.log('Audio context started')
    }

    private createUi(): HTMLElement {
        let uiWrapper = document.createElement('section')
        const noteCells = this.createNoteCells()
        const columns = this.createHighlightCOlumns()
        const playPause = this.togglePlayButton()
        const randomizer = this.createRandomButton()
        const reset = this.createResetButton()
        const contentWrapper = createElement('div', {
            id: 'contentWrapper'
        })
        const menuWrapper = createElement('div', {
            id: 'menuWrapper'
        })
        menuWrapper.append(playPause, randomizer, reset)
        contentWrapper.append(noteCells, columns)
        uiWrapper.append(menuWrapper, contentWrapper)

        return uiWrapper
    }

    private createHighlightCOlumns(): HTMLElement {

        let columnsContainer = createElement('div', {
            id: 'columnsWrapper'
        })

        for (let i = 0; i < this.ncols; i++) {
            let column = createElement('article')
            columnsContainer.appendChild(column)
        }
        return columnsContainer
    }

    private createNoteCells(): HTMLElement {

        let cellsContainer = createElement('div', {
            id: 'noteCellsWrapper'
        })

        for (let row = 0; row < this.nrows; row++) {
            for (let col = 0; col < this.ncols; col++) {

                let button = createElement('input', {
                    'type': 'checkbox',
                    'className': 'noteCell',
                    'dataset': {
                        'col': col.toString(),
                        'row': row.toString(),
                    },
                    'onchange': (e: Event) => {
                        this.toggleMatrixCell(e);
                        (e.target as HTMLElement).classList.toggle('active')
                    },
                })

                cellsContainer.appendChild(button)
            }
        }

        return cellsContainer
    }

    private togglePlayButton(): HTMLElement {
        let input = createElement('button', {
            'type': 'button',
            'className': 'menuInput',
            'id': 'playPause',
            'onpointerdown': (e: Event) => this.togglePlayPause(),
        })
        input.textContent = '⏯️'

        return input
    }

    private togglePlayPause(): void {
        if (!this.contextStarted) {
            this.startAudioContext()
            this.startScheduleRepeat()
            Tone.Transport.start()            
        } else {
            Tone.Transport.toggle()
        }
    }

    private toggleMatrixCell(e: Event): void {
        e.preventDefault()
        const row = Number((e.target as HTMLElement).dataset.row)
        const col = Number((e.target as HTMLElement).dataset.col)
        this.matrix[col][row] = this.matrix[col][row] === 0 ? 1 : 0
    }

}