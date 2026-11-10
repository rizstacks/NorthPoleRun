export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('Santa', 'assets/char.png');
        this.load.image('background', 'assets/bg.png');
    }

    create() {

        //this just makes the sprites for the char and background, but doesn't do anything with them yet
        this.background = this.add.sprite(640, 360, 'background');
        this.player = this.add.sprite(640, 360, 'Santa');
        //this.init_game();

        this.upW = this.input.keyboard.addKey("W", false, true);
        this.downS = this.input.keyboard.addKey("S", false, true);
        this.leftA = this.input.keyboard.addKey("A", false, true);
        this.rightR = this.input.keyboard.addKey("D", false, true);
        this.upArr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false, true);
        this.downArr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false, true);
        this.leftArr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, false, true);
        this.rightArr = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, false, true);
    }

    update(time, delta){
        let dt = delta / 1000;


    }
}
