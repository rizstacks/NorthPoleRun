
const SANTA_STATS = { hp: 100, damage: 15 };  

const ENEMY_TYPES = {
  agent:        { name: 'IRS Agent',        hp: 40,  damage: 10 },
  auditor:      { name: 'Auditor',          hp: 35,  damage: 8  },
  collector:    { name: 'Tax Collector',    hp: 140, damage: 22 },
  commissioner: { name: 'The Commissioner', hp: 600, damage: 25 },
};

class Santa extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'santa');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.maxHp = SANTA_STATS.hp;
    this.hp = this.maxHp;
    this.damage = SANTA_STATS.damage;
  }

  attack(enemy) {
    enemy.takeDamage(this.damage);
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.scene.events.emit('santa-dead');
      this.destroy();
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'enemy_' + type);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const stats = ENEMY_TYPES[type];
    this.type = type;
    this.damage = stats.damage;
    this.maxHp = stats.hp;
    this.hp = this.maxHp;
  }

  attack(santa) {
    santa.takeDamage(this.damage);
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.scene.events.emit('enemy-died', this);
      this.destroy();
    }
  }
}
