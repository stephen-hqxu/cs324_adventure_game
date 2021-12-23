import {
    PlaneBufferGeometry, 
    Mesh, 
    MeshPhongMaterial,
    TextureLoader
} from "../Library/three.module.js";
import {
    Plane, 
    Body, 
    Material, 
    ContactMaterial
} from "../Library/cannon-es.js";

/**
 * @brief The bottom surface of the game scene.
 */
class Ground{
    //THREE geometry
    GroundGeo = new PlaneBufferGeometry(50, 50, 5, 5);
    GroundRender;
    GroundMesh;

    //CANNON geometry
    GroundShape = new Plane();
    GroundMat = new Material("physics");
    GroundContactMat = new ContactMaterial(this.GroundMat, this.GroundMat, {
        friction: 0.8, 
        restitution: 0.3
    });
    GroundBody = new Body({
        mass: 0,
        material: this.GroundMat
    });

    constructor(){
        //setup rendering material for the ground
        var groundTexture = new TextureLoader();
        groundTexture.setPath("./Resource/Grass004_1K-PNG/Grass004_1K_");
        this.GroundRender = new MeshPhongMaterial({
            map: groundTexture.load("Color.png"),
            aoMap: groundTexture.load("AmbientOcclusion.png"),
            bumpMap: groundTexture.load("Displacement.png"),
            normalMap: groundTexture.load("NormalGL.png"),
            specularMap: groundTexture.load("Roughness.png")
        });
        //rotate the ground so it is z-up
        this.GroundGeo.rotateX(-Math.PI / 2.0);

        this.GroundMesh = new Mesh(this.GroundGeo, this.GroundRender);
        this.GroundMesh.receiveShadow = true;

        //construct shape
        this.GroundBody.addShape(this.GroundShape);
        this.GroundBody.quaternion.setFromEuler(-Math.PI / 2.0, 0.0, 0.0);
    }

    /**
     * Add the current ground body to the world.
     * @param {THREE.Scene} scene The rendering scene to be added.
     * @param {CANNON.World} world The physics world to be added.
     */
    addToWorld(scene, world){
        scene.add(this.GroundMesh);

        world.addContactMaterial(this.GroundContactMat);
        world.addBody(this.GroundBody);
    }

};

export {Ground};