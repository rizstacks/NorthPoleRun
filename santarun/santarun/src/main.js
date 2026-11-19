import { Start } from './scenes/Start.js';
import { GameOver } from './scenes/GameOver.js';
import { Win } from './scenes/Win.js';

const config = {
    type: Phaser.AUTO,
    title: 'North Pole Run',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
    scene: [Start, GameOver, Win],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);