const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 450,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let obstacles;
let goal;
let gameOver = false;
let infoText;

function preload() {
  // 簡易グラフィック（Phaser のビルトイン図形を使う）
}

function create() {
  // 地面
  const ground = this.add.rectangle(400, 420, 1600, 60, 0x654321);
  this.physics.add.existing(ground, true); // immovable static body

  // プレイヤー（人形の代わりに四角）
  player = this.add.rectangle(150, 350, 40, 60, 0x00aaff);
  this.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  player.body.setBounce(0);
  player.body.setSize(40, 60);
  player.body.setOffset(0, 0);

  // 地面との当たり判定
  this.physics.add.collider(player, ground);

  // 障害物グループ
  obstacles = this.physics.add.group();

  // ゴールフラッグ
  goal = this.add.rectangle(1400, 340, 30, 120, 0xffd700);
  this.physics.add.existing(goal, true);

  // プレイヤーと障害物の当たり判定
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // プレイヤーとゴールの当たり判定
  this.physics.add.overlap(player, goal, reachGoal, null, this);

  // カメラ設定（プレイヤーを追いかける）
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, 1600, 450);

  // キーボード入力
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 障害物を定期的に生成
  this.time.addEvent({
    delay: 1500,
    loop: true,
    callback: () => {
      if (gameOver) return;
      const x = Phaser.Math.Between(player.x + 400, player.x + 600);
      const obstacle = obstacles.create(x, 360, null);
      obstacle.setSize(40, 60);
      obstacle.body.setImmovable(true);
      obstacle.body.allowGravity = false;

      // 見た目
      const rect = this.add.rectangle(x, 360, 40, 60, 0xff0000);
      obstacle.rect = rect;
    }
  });

  // 画面上のテキスト
  infoText = this.add.text(16, 16, 'SPACEでジャンプしてゴールへ', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setScrollFactor(0);
}

function update() {
  if (gameOver) return;

  // プレイヤーを右に自動で走らせる
  player.body.setVelocityX(200);

  // ジャンプ（地面に接地しているときだけ）
  if (Phaser.Input.Keyboard.JustDown(cursors.space) || Phaser.Input.Keyboard.JustDown(cursors.up)) {
    if (player.body.blocked.down) {
      player.body.setVelocityY(-450);
    }
  }

// 障害物を左に動かす
obstacles.children.iterate(obstacle => {
  if (!obstacle) return;

  // 左へ移動
  obstacle.body.setVelocityX(-200);

  // 見た目の四角も追従
  if (obstacle.rect) {
    obstacle.rect.x = obstacle.x;
    obstacle.rect.y = obstacle.y;
  }

  // 画面外に出たら削除
  if (obstacle.x < player.x - 800) {
    obstacle.rect.destroy();
    obstacle.destroy();
  }
});



  // 障害物の見た目を物理ボディに追従させる
  obstacles.children.iterate(obstacle => {
    if (!obstacle || !obstacle.rect) return;
    obstacle.rect.x = obstacle.x;
    obstacle.rect.y = obstacle.y;
  });
}

function hitObstacle(playerObj, obstacle) {
  gameOver = true;
  infoText.setText('ゲームオーバー：Rキーでリスタート');

  // 物理を完全停止
  this.physics.pause();

  // 障害物の見た目を削除（緑四角の原因）
  //if (obstacle.rect) obstacle.rect.destroy();

  playerObj.body.setVelocity(0, 0);

  const scene = obstacle.scene;
  scene.input.keyboard.once('keydown-R', () => {
    scene.scene.restart();
    gameOver = false;
  });
}


function reachGoal(playerObj, goalObj) {
  gameOver = true;
  infoText.setText('ゴール！ おめでとう！ Rキーでもう一度');

  // 物理を完全停止
  this.physics.pause();

  // 全障害物の見た目を削除
//  obstacles.children.iterate(ob => {
//    if (ob.rect) ob.rect.destroy();
//  });

  playerObj.body.setVelocity(0, 0);

  const scene = goalObj.scene;
  scene.input.keyboard.once('keydown-R', () => {
    scene.scene.restart();
    gameOver = false;
  });
}

