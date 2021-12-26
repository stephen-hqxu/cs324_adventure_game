import {
    PlaneBufferGeometry, 
    Mesh, 
    MeshPhongMaterial,
    TextureLoader,
    RepeatWrapping,
    LinearFilter,
    LinearMipmapLinearFilter,
    Vector3
} from "../Library/three.module.js";
import {
    Plane, 
    Body
} from "../Library/cannon-es.js";

/**
 * @brief The bottom surface of the game scene.
 */
class Ground{
    //THREE geometry
    GroundGeo = new PlaneBufferGeometry(200, 200, 5, 5);
    GroundRender;
    GroundMesh;

    //CANNON geometry
    GroundShape = new Plane();
    GroundBody;

    /**
     * Create a new ground for the scene.
     * @param {CANNON.Material} phy_mat The physics material for the ground.
     */
    constructor(phy_mat){
        //setup rendering material for the ground
        var groundTexture = new TextureLoader();
        groundTexture.setPath("./Resource/Grass004_1K-PNG/Grass004_1K_");
        const load = (name) => {
            const map = groundTexture.load(name);
            //set map property
            map.wrapS = RepeatWrapping;
            map.wrapT = RepeatWrapping;
            map.repeat.set(40.0, 40.0);
            map.generateMipmaps = true;
            map.minFilter = LinearMipmapLinearFilter;
            map.magFilter = LinearFilter;
            map.anisotropy = 16.0;

            return map;
        };

        this.GroundRender = new MeshPhongMaterial({
            map: load("Color.png"),
            aoMap: load("AmbientOcclusion.png"),
            bumpMap: load("Displacement.png"),
            normalMap: load("NormalGL.png"),
            specularMap: load("Roughness.png")
        });
        this.GroundRender.shininess = 16.0;
        //rotate the ground so it is z-up
        this.GroundGeo.rotateX(-Math.PI / 2.0);
        this.GroundGeo.translate(100.0, 0.0, -100.0);

        this.GroundMesh = new Mesh(this.GroundGeo, this.GroundRender);
        this.GroundMesh.receiveShadow = true;

        //construct shape
        this.GroundBody = new Body({
            mass: 0.0,
            material: phy_mat
        });
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

        world.addBody(this.GroundBody);
    }

};

export {Ground};