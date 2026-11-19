import { sfx } from '../sfx.js';

const GOTH = "Georgia, 'Times New Roman', serif";

export class Win extends Phaser.Scene {
    constructor() { super('Win'); }

    init(data) {
        this.coins = data.coins || 0;
        this.total = data.total || 0;
    }

    preload() {
        this.load.image('background', 'assets/bg.png');
    }

    create() {
        this.add.sprite(640, 360, 'background').setTint(0x1c1c2c);
        this.add.text(640, 240, 'You made it down the chimney!', {
            fontFamily: GOTH, fontStyle: 'italic', fontSize: '64px', fill: '#d9d2e9', align: 'center', wordWrap: { width: 1100 }
        }).setOrigin(0.5);
        this.add.text(640, 380, `Gifts collected: ${this.coins} / ${this.total}`, { fontFamily: GOTH, fontSize: '44px', fill: '#c9a227' }).setOrigin(0.5);
        this.add.text(640, 500, 'Press R to play again', { fontFamily: GOTH, fontSize: '40px', fill: '#a9a3b8' }).setOrigin(0.5);
        sfx.win(this);
        this.input.keyboard.once('keydown-R', () => this.scene.start('Start'));
    }
}