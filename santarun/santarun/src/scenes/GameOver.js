const GOTH = "Georgia, 'Times New Roman', serif";

export class GameOver extends Phaser.Scene {
    constructor() { super('GameOver'); }

    preload() {
        this.load.image('background', 'assets/bg.png');
    }

    create() {
        this.add.sprite(640, 360, 'background').setTint(0x15151f);
        this.add.text(640, 280, 'Is that the best you can do?', {
            fontFamily: GOTH, fontStyle: 'italic', fontSize: '72px', fill: '#b3203a', align: 'center', wordWrap: { width: 1100 }
        }).setOrigin(0.5);
        this.add.text(640, 500, 'Press R to restart', { fontFamily: GOTH, fontSize: '40px', fill: '#a9a3b8' }).setOrigin(0.5);
        this.input.keyboard.once('keydown-R', () => this.scene.start('Start'));
    }
}