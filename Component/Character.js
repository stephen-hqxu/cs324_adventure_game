import {
    PerspectiveCamera, 
    SphereBufferGeometry,
    MeshLambertMaterial,
    Mesh
} from "../Library/three.module.js";
//Controller
import {
    PointerLockControlsCannon
} from "../Library/Control/PointerLockControlsCannon.js";
//Physics engine
import {
    Sphere,
    Body,
    Material,
    ContactMaterial
} from "../Library/cannon-es.js";

/**
 * @brief Handles the main character controled by the player.
 */
class Character{
    ActiveCamera = new PerspectiveCamera(60.0, Character.currentAspect(), 1.0, 50.0);
    Controller;

    //the model of the character
    CharGeo = new SphereBufferGeometry(1.3, 5, 5);
    CharRender = new MeshLambertMaterial({
        color: 0xeeeeee
    });
    CharMesh = new Mesh(this.CharGeo, this.CharRender);

    CharShape = new Sphere(1.3);
    CharMat = new Material("physics");
    CharContactMat = new ContactMaterial(this.CharMat, this.CharMat,{
        friction: 0.25,
        restitution: 0.0
    });
    CharBody = new Body({
        mass: 0.5, 
        material: this.CharMat
    });

    /**
     * @brief Initialise a new character
     */
    constructor(){
        //setup character collision body
        this.CharBody.addShape(this.CharShape);
        this.CharBody.position.set(0.0, 5.0, 0.0);
        this.CharBody.linearDamping = 0.9;

        //setup controller
        this.Controller = new PointerLockControlsCannon(this.ActiveCamera, this.CharBody);

    }

    /**
     * Calculate the current aspect ratio of the window.
     * @returns The aspect ratio.
     */
    static currentAspect(){
        return window.innerWidth / window.innerHeight;
    }

    /**
     * Add the current character to the world.
     * @param {THREE.Scene} scene The rendering scene to be added.
     * @param {CANNON.World} world The physics world to be added.
     */
    addToWorld(scene, world){
        scene.add(this.Controller.getObject());

        world.addContactMaterial(this.CharContactMat);
        world.addBody(this.CharBody);
    }

    /**
     * @brief Trigger window resize event on the camera
     */
    resize(){
        //update the aspect ratio of the camera
        this.ActiveCamera.aspect = Character.currentAspect();
        this.ActiveCamera.updateProjectionMatrix();
    }

    /**
     * @brief Update the controller.
     * @param {number} delta The delta frame time in ms.
     */
    update(delta){
        this.Controller.update(delta);
    }

};

export {Character};