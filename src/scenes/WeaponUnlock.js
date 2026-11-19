const GOTH = "Georgia, 'Times New Roman', serif";

export class WeaponUnlock extends Phaser.Scene {
    constructor() {
        super('WeaponUnlock');
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x070610, 0.9);
        this.add.text(640, 245, 'NEW WEAPON UNLOCKED!', {
            fontFamily: GOTH,
            fontStyle: 'italic',
            fontSize: '58px',
            fill: '#d9d2e9',
            stroke: '#000',
            strokeThickness: 6,
            align: 'center',
        }).setOrigin(0.5);
        this.add.text(640, 350, 'TRIPLE BLASTER', {
            fontFamily: GOTH,
            fontSize: '42px',
            fill: '#66ddff',
            stroke: '#000',
            strokeThickness: 5,
        }).setOrigin(0.5);
        this.add.text(640, 425, 'Hold SPACE to fire a faster three-shot spread.\nEach bolt keeps its normal damage.', {
            fontFamily: GOTH,
            fontSize: '28px',
            fill: '#e2dcf0',
            align: 'center',
            lineSpacing: 12,
        }).setOrigin(0.5);
        this.add.text(640, 555, 'Press ENTER or click to resume', {
            fontFamily: GOTH,
            fontSize: '30px',
            fill: '#c9a227',
        }).setOrigin(0.5);

        let resumed = false;
        const resumeGame = () => {
            if (resumed) return;
            resumed = true;
            this.scene.stop();
            this.scene.resume('Level2');
        };
        this.input.keyboard.once('keydown-ENTER', resumeGame);
        this.input.once('pointerdown', resumeGame);
    }
}
