import Phaser from "phaser";

export default class Dialog extends Phaser.GameObjects.Container {
    
    constructor(scene, x, y, text){
        super(scene, x, y);

        this.balloon = scene.add.graphics();
        this.balloon.fillStyle(0x3d3d3c, 0.7);
        this.balloon.fillRoundedRect(-110, 190, 200, 50, 10);

        this.text = scene.add.text(-10, 210, text, {
            color: '#ffffff',
            fontSize: '13px',
            wordWrap: {width: 180},
            align:'center'
        });

        this.text.setOrigin(0.5);

        this.add(this.balloon);
        this.add(this.text);
        scene.add.existing(this);

        setTimeout(() => {
            this.setVisible(false);
            this.destroy;
        }, 2000); 

    }
}
