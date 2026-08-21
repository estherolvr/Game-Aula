import Phaser from 'phaser';

const SHIP_SPEED = 280;
const BULLET_SPEED = 650;
const FIRE_COOLDOWN = 400; // ms
const MAX_HP = 100;
const BULLET_DAMAGE = 20;
const WIN_ROUNDS = 3;

interface ShipData {
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  lastFired: number;
  playerId: number;
  bullets: Phaser.GameObjects.Group; // Simple group, not physics group
}

export class ArenaScene extends Phaser.Scene {
  private p1Data!: ShipData;
  private p2Data!: ShipData;
  private scoreP1 = 0;
  private scoreP2 = 0;
  private roundActive = false;

  // Bullet arrays tracked manually
  private bulletsP1: Phaser.Physics.Arcade.Sprite[] = [];
  private bulletsP2: Phaser.Physics.Arcade.Sprite[] = [];

  constructor() { super('ArenaScene'); }

  init(data: { scoreP1?: number; scoreP2?: number }) {
    this.scoreP1 = data.scoreP1 ?? 0;
    this.scoreP2 = data.scoreP2 ?? 0;
    this.bulletsP1 = [];
    this.bulletsP2 = [];
    this.roundActive = false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.image(W / 2, H / 2, 'starfield');

    // Arena border glow
    const borderGfx = this.add.graphics();
    borderGfx.lineStyle(3, 0x00d2ff, 0.6);
    borderGfx.strokeRect(40, 65, W - 80, H - 105);

    // Physics bounds for ships only
    this.physics.world.setBounds(40, 65, W - 80, H - 105);

    // Create ships
    this.p1Data = this.makeShip(180, H / 2, 'ship_p1', 0);
    this.p2Data = this.makeShip(W - 180, H / 2, 'ship_p2', 1);

    // Scale AI images to fit the arena nicely
    this.p1Data.sprite.setScale(0.12);
    this.p2Data.sprite.setScale(0.12);

    // Controls — store on instance via any to avoid TS class field issues
    const kb = this.input.keyboard!;
    const cursorKeys = kb.createCursorKeys();

    (this as any)._wasdKeys = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      fire:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };
    (this as any)._arrowKeys = {
      up:    cursorKeys.up,
      down:  cursorKeys.down,
      left:  cursorKeys.left,
      right: cursorKeys.right,
      fire:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    };

    // HUD
    this.scene.launch('HUDScene', {
      arenaScene: this,
      scoreP1: this.scoreP1,
      scoreP2: this.scoreP2
    });

    // Countdown → start
    this.showCountdown(() => {
      this.roundActive = true;
    });
  }

  private makeShip(x: number, y: number, texture: string, playerId: number): ShipData {
    const sprite = this.physics.add.sprite(x, y, texture);
    sprite.setCollideWorldBounds(true);
    sprite.setDrag(0);
    return {
      sprite,
      hp: MAX_HP,
      lastFired: 0,
      playerId
    } as ShipData;
  }

  private showCountdown(onDone: () => void) {
    const W = this.scale.width, H = this.scale.height;
    let count = 3;

    const txt = this.add.text(W / 2, H / 2, '3', {
      fontSize: '130px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial',
      stroke: '#00d2ff', strokeThickness: 8
    }).setOrigin(0.5).setDepth(200);

    this.time.addEvent({
      delay: 900, repeat: 3,
      callback: () => {
        count--;
        if (count > 0) {
          txt.setText(`${count}`);
          txt.setScale(1);
          this.tweens.add({ targets: txt, scaleX: 1.6, scaleY: 1.6, alpha: 0.1, duration: 850 });
        } else {
          txt.setText('LUTE!').setStyle({ color: '#00ff88', fontSize: '80px', stroke: '#005500', strokeThickness: 6 });
          txt.setScale(1).setAlpha(1);
          this.tweens.add({
            targets: txt, alpha: 0, scaleX: 2, scaleY: 2, duration: 700, delay: 300,
            onComplete: () => { txt.destroy(); onDone(); }
          });
        }
      }
    });
  }

  update(time: number) {
    if (!this.roundActive) return;

    const wasdKeys = (this as any)._wasdKeys;
    const arrowKeys = (this as any)._arrowKeys;

    // Move ships
    this.moveShip(this.p1Data.sprite, wasdKeys.up, wasdKeys.down, wasdKeys.left, wasdKeys.right);
    this.moveShip(this.p2Data.sprite, arrowKeys.up, arrowKeys.down, arrowKeys.left, arrowKeys.right);

    // Rotate ships to always face each other
    const angle1 = Phaser.Math.Angle.Between(
      this.p1Data.sprite.x, this.p1Data.sprite.y,
      this.p2Data.sprite.x, this.p2Data.sprite.y
    );
    this.p1Data.sprite.setRotation(angle1);

    const angle2 = Phaser.Math.Angle.Between(
      this.p2Data.sprite.x, this.p2Data.sprite.y,
      this.p1Data.sprite.x, this.p1Data.sprite.y
    );
    this.p2Data.sprite.setRotation(angle2);

    // Fire
    if (Phaser.Input.Keyboard.JustDown(wasdKeys.fire)) this.fire(this.p1Data, time);
    if (Phaser.Input.Keyboard.JustDown(arrowKeys.fire)) this.fire(this.p2Data, time);

    // Check bullet collisions manually
    this.checkBulletHits(this.bulletsP1, this.p2Data);
    this.checkBulletHits(this.bulletsP2, this.p1Data);

    // Clean up out-of-bounds bullets
    this.cleanBullets(this.bulletsP1);
    this.cleanBullets(this.bulletsP2);

    // HP update for HUD
    this.events.emit('hpUpdate', this.p1Data.hp, this.p2Data.hp);
  }

  private moveShip(sprite: Phaser.Physics.Arcade.Sprite, up: Phaser.Input.Keyboard.Key, down: Phaser.Input.Keyboard.Key, left: Phaser.Input.Keyboard.Key, right: Phaser.Input.Keyboard.Key) {
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    let vx = 0, vy = 0;
    if (up.isDown) vy = -SHIP_SPEED;
    if (down.isDown) vy = SHIP_SPEED;
    if (left.isDown) vx = -SHIP_SPEED;
    if (right.isDown) vx = SHIP_SPEED;
    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }
    body.setVelocity(vx, vy);
  }

  private fire(shipData: ShipData, time: number) {
    if (time - shipData.lastFired < FIRE_COOLDOWN) return;
    shipData.lastFired = time;

    const { sprite, playerId } = shipData;
    const angle = sprite.rotation;

    // Spawn bullet slightly ahead of the ship nose
    const offsetX = Math.cos(angle) * 30;
    const offsetY = Math.sin(angle) * 30;

    const bullet = this.physics.add.sprite(sprite.x + offsetX, sprite.y + offsetY, 'bullet_base');
    bullet.setTint(playerId === 0 ? 0x00d2ff : 0xff2d78);
    bullet.setRotation(angle);
    bullet.setScale(1.4, 1);

    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * BULLET_SPEED, Math.sin(angle) * BULLET_SPEED);

    if (playerId === 0) {
      this.bulletsP1.push(bullet);
    } else {
      this.bulletsP2.push(bullet);
    }
  }

  private checkBulletHits(bullets: Phaser.Physics.Arcade.Sprite[], targetData: ShipData) {
    const target = targetData.sprite;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b.active) { bullets.splice(i, 1); continue; }

      const dist = Phaser.Math.Distance.Between(b.x, b.y, target.x, target.y);
      if (dist < 28) {
        // Hit!
        b.destroy();
        bullets.splice(i, 1);
        this.onHit(targetData);
      }
    }
  }

  private cleanBullets(bullets: Phaser.Physics.Arcade.Sprite[]) {
    const W = this.scale.width, H = this.scale.height;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b.active || b.x < 0 || b.x > W || b.y < 0 || b.y > H) {
        if (b.active) b.destroy();
        bullets.splice(i, 1);
      }
    }
  }

  private onHit(targetData: ShipData) {
    targetData.hp -= BULLET_DAMAGE;
    if (targetData.hp < 0) targetData.hp = 0;

    // Flash
    this.tweens.add({
      targets: targetData.sprite, alpha: 0.1, duration: 70,
      yoyo: true, repeat: 3,
      onComplete: () => targetData.sprite.setAlpha(1)
    });

    this.cameras.main.shake(100, 0.01);

    if (targetData.hp <= 0) {
      this.roundActive = false;
      const winnerPlayer = targetData.playerId === 0 ? 2 : 1;
      this.endRound(winnerPlayer, targetData.sprite);
    }
  }

  private endRound(winner: number, loserSprite: Phaser.Physics.Arcade.Sprite) {
    this.explode(loserSprite);
    if (winner === 1) this.scoreP1++;
    else this.scoreP2++;

    this.time.delayedCall(2000, () => {
      this.scene.stop('HUDScene');
      if (this.scoreP1 >= WIN_ROUNDS || this.scoreP2 >= WIN_ROUNDS) {
        this.scene.start('ResultScene', { winner, scoreP1: this.scoreP1, scoreP2: this.scoreP2 });
      } else {
        this.scene.restart({ scoreP1: this.scoreP1, scoreP2: this.scoreP2 });
      }
    });
  }

  private explode(ship: Phaser.Physics.Arcade.Sprite) {
    ship.setVisible(false);
    (ship.body as Phaser.Physics.Arcade.Body).enable = false;

    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 70, () => {
        const jx = Phaser.Math.Between(-15, 15);
        const jy = Phaser.Math.Between(-15, 15);
        const exp = this.add.image(ship.x + jx, ship.y + jy, `explosion_${i}`).setDepth(50);
        this.time.delayedCall(120, () => exp.destroy());
      });
    }

    // Particle burst
    const color = (ship as any).playerId === 0 ? 0x00d2ff : 0xff2d78;
    const emitter = this.add.particles(ship.x, ship.y, 'bullet_base', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 700,
      quantity: 40,
      tint: color
    } as any);
    this.time.delayedCall(800, () => emitter.destroy());
  }
}
