
import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";
import Dialog from "../entities/Dialog";

export default class Lab extends Scene {
  /** @type {Phaser.Tilemaps.Tilemap} */
  map;
  layers = {};
  /** @type {Player} */
  player;
  touch;
  //** @type {Phaser.Physics.Arcade.Group} */
  objectGroup;

  isTouching = false;

  constructor() {
    super('Lab');
  }

  preload() {
    this.load.tilemapTiledJSON('lab-tilemap-info', 'mapas/lab_info.json');

    this.load.image('office-tiles', 'mapas/tiles/tiles_office.png');

    this.load.spritesheet('player', 'mapas/tiles/diego.png', {
      frameWidth: CONFIG.TILE_SIZE,
      frameHeight: CONFIG.TILE_SIZE * 2
    });

    this.load.spritesheet('lixeira1', 'mapas/tiles/lixeiras_spritesheet.png', {
      frameWidth: CONFIG.TILE_SIZE,
      frameHeight: CONFIG.TILE_SIZE * 2
    });
  }

  create() {
    this.createMap();
    this.createLayers();
    this.createObjects();
    this.createPlayer();
    this.createColliders();
    this.createCamera();
    this.createLixeira();
  }

  update() { }

  createPlayer() {
    this.touch = new Touch(this, 144, 90);
    this.player = new Player(this, 144, 90, this.touch);
    this.player.setDepth(3);
  }

  createLixeira() {
    const yellowTrash = this.add.sprite(184, 48, 'lixeira1', 0);
    const blueTrash = this.add.sprite(200, 48, 'lixeira1', 3);
  }

  createMap() {
    this.map = this.make.tilemap({
      key: 'lab-tilemap-info',
      tileWidth: CONFIG.TILE_SIZE,
      tileHeight: CONFIG.TILE_SCALE
    });

    this.map.addTilesetImage('tiles_office', 'office-tiles');
  }

  createObjects() {
    this.objectGroup = this.physics.add.group();

    const objects = this.map.createFromObjects('Objects', 'Objects', 'Objects', {
      nome: 'eletronico',
      nome: 'bebida'
    });

    this.physics.world.enable(objects);

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const prop = this.map.objects[0].objects[i];

      obj.setDepth(this.layers.length + 1);
      obj.setVisible(false);

      this.objectGroup.add(obj);
    }
  }

  createLayers() {
    const officeTiles = this.map.getTileset('tiles_office');

    const layerNames = this.map.getTileLayerNames();

    for (let i = 0; i < layerNames.length; i++) {
      const name = layerNames[i];
      this.layers[name] = this.map.createLayer(name, [officeTiles], 0, 0);
      this.layers[name].setDepth(i);

      if (name.endsWith('collision')) {
        this.layers[name].setCollisionByProperty({ collide: true });
      }
    }
  }

  createCamera() {
    const mapWidth = this.map.width * CONFIG.TILE_SIZE;
    const mapHeight = this.map.height * CONFIG.TILE_SIZE;

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player);
  }

  createColliders() {
    const layerNames = this.map.getTileLayerNames();

    for (let i = 0; i < layerNames.length; i++) {
      const name = layerNames[i];

      if (name.endsWith('collision')) {
        this.physics.add.collider(this.player, this.layers[name]);
      }
    }

    this.physics.add.overlap(this.touch, this.objectGroup, this.handleTouch, undefined, this);
  }

  handleTouch(touch, objects) {
    if (this.isTouching && this.player.isAction) {
      return;
    }

    if (this.isTouching && !this.player.isAction) {
      this.isTouching = false;
      return;
    }

    if (this.player.isAction) {
      this.isTouching = true;

      if (objects.name == 'cadeira') {
        if (this.player.body.enable == true) {
          this.player.body.enable = false;
          this.player.x = objects.x - 0;
          this.player.y = objects.y - 8;
          this.player.direction = 'up';
          this.player.setDepth(1);
          console.log('Personagem sentado');
        } else {
          this.player.body.enable = true;
          this.player.x = objects.x + 16;
          this.player.y = objects.y - 8;
          this.player.setDepth(3);
        }
      }

      if (objects.name == 'lixeiraLaranja') {
        if (this.player.body.enable == true) {
          this.player.body.enable = false;
          const yellowTrash = this.add.sprite(184, 48, 'lixeira1', 2);
          const dialog = new Dialog(this, 150, 150, 'Lixeira laranja está cheia!');
        } else {
          this.player.body.enable = true;
          const yellowTrash = this.add.sprite(184, 48, 'lixeira1', 0);
        }
      }

      if (objects.name == 'lixeiraAzul') {
        if (this.player.body.enable == true) {
          this.player.body.enable = false;
          const blueTrash = this.add.sprite(200, 48, 'lixeira1', 4);
          const dialog = new Dialog(this, 150, 150, 'Lixeira azul vazia!');
        } else {
          this.player.body.enable = true;
          const blueTrash = this.add.sprite(200, 48, 'lixeira1', 3);
        }
      }
    }

    if (objects.name == 'bebida') {
      if (this.player.body.enable == true) {
        const dialog = new Dialog(this, 150, 150, 'Proibido o consumo de bebidas!');
        dialog.setVisible(true);
      }
    }

    if (objects.name == 'eletronico') {
      if (this.player.body.enable == true) {
        const dialog = new Dialog(this, 150, 150, 'Proibido o uso de aparelhos eletrônicos!');
        dialog.setVisible(true);
      }
    }

    if (this.player.isAction) {
      this.isTouching = true;
      if (objects.name == 'quadro') {
        const dialog = new Dialog(this, 150, 150, 'O quadro está em branco!');
        dialog.setVisible(true);
      }
    }
  }
}