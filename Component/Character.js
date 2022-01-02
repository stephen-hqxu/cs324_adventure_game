import {
    PerspectiveCamera, 
    SphereBufferGeometry,
    MeshLambertMaterial,
    Mesh,
    Vector3
} from "../Library/three.module.js";
//Controller
import {
    PointerLockControlsCannon
} from "../Control/PointerLockControlsCannon.js";
//Physics engine
import {
    Sphere,
    Body
} from "../Library/cannon-es.js";

/**
 * @brief Handles the main character controled by the player.
 */
class Character{
    ActiveCamera = new PerspectiveCamera(60.0, Character.currentAspect(), 0.1, 120.0);
    //indication of view type, 1 is first person and so on.
    CameraView = 1;
    Controller;

    //the model of the character
    CharGeo = new SphereBufferGeometry(0.1, 32, 32);
    CharRender = new MeshLambertMaterial({
        color: 0xeeeeee
    });
    CharMesh = new Mesh(this.CharGeo, this.CharRender);

    CharShape = new Sphere(0.1);
    CharBody;

    /**
     * @brief Initialise a new character.
     * @param {CANNON.Material} phy_mat The physics material for the character.
     */
    constructor(phy_mat){
        //setup character collision body
        this.CharBody = new Body({
            mass: 60.0,
            material: phy_mat
        });
        this.CharBody.addShape(this.CharShape);
        this.CharBody.linearDamping = 0.95;
        this.CharBody.angularDamping = 0.9;

        this.CharMesh.castShadow = true;

        //setup controller
        this.Controller = new PointerLockControlsCannon(this.ActiveCamera, this.CharBody, () => {
            $(this).trigger("death");
        });

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
        //add camera to the scene
        scene.add(this.Controller.getObject());
        this.Controller.registerWorld(world);
        //add the character representation
        scene.add(this.CharMesh);
        this.CharMesh.castShadow = true;

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

        //update character position
        const worldPos = new Vector3();
        this.Controller.getObject().getWorldPosition(worldPos);
        this.CharMesh.position.copy(worldPos);
    }

    /**
     * @brief Switch the camera view type between first person and second person.
     */
    switchView(){
        //determine the view type to be switched to.
        const view = (this.CameraView == 1) ? 2 : 1;

        //get the camera view direction
        const offset = new Vector3(0.0, 0.0, -1.0);
        offset.applyQuaternion(this.ActiveCamera.quaternion);
        const orbitRadius = 2.0;

        switch(view){
            case 2: 
                //to switch from 1st to 2nd person, offset the camera in reverse to its view direction
                //the camera will be orbiting around the character
                offset.negate();
            case 1:
                //to switch from 2nd to 1st, just do it in reverse.
                this.ActiveCamera.translateOnAxis(offset, orbitRadius);
                break;
            default:
                console.error("Unsupported view type");
                break;
        }

        //update the current type
        this.CameraView = view;
    }

};

export {Character};