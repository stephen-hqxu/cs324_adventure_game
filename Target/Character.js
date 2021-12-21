import {
    Vector3, 
    PerspectiveCamera, 
    SphereGeometry, 
    MeshPhongMaterial, 
    Mesh
} from "../Library/three.module";
//Controller
import {PointerLockControls} from "../Library/Control/PointerLockControls.js";

/**
 * @brief Handles the main character controled by the player.
 */
class Character{
    ActiveCamera = new PerspectiveCamera({ fov: 60.0, near: 1.0, far: 200.0 });
    Controller = new PointerLockControls(this.ActiveCamera, $("body").get(0));

    //record the camera properties
    _Direction = new Vector3();
    _Velocity = new Vector3();
    _Sensitivity;

    _Forward = false;
    _Backward = false;
    _Left = false;
    _Right = false;
    _CanJump = false;

    //the model of the character
    _Model = new SphereGeometry({ radius: 1.0 });
    _ModelMaterial = new MeshPhongMaterial();
    _ModelMesh = new Mesh();

    /**
     * @brief Initialise a new game camera instance.
     * @param {number} sensitivity Contrls the movement sensitivity of the camera.
     */
    constructor(sensitivity = 1.0){
        this._Direction.setScalar(0.0);
        this._Velocity.setScalar(0.0);

        this._Sensitivity = sensitivity;

        this.ActiveCamera.aspect = Character.currentAspect();
    }

    /**
     * Calculate the current aspect ratio of the window.
     * @returns The aspect ratio.
     */
    static currentAspect(){
        return window.innerWidth / window.innerHeight;
    }

    /**
     * @brief Process an event to set a move status.
     * @param {*} event A DOM event.
     */
    move(event){
        switch(event.code){
            case "KeyW": this._Forward = true;
                break;
            case "KeyS": this._Backward = true;
                break;
            case "KeyA": this._Left = true;
                break;
            case "KeyD": this._Right = true;
                break;
            case "Space":
                //jump upwards
                if(this._CanJump){
                    this._Velocity += 10.0;
                    this._CanJump = false;
                } 
                break;
            default:
                break;
        }
    }

    /**
     * @brief Process an event to unset a move status.
     * @param {*} event A DOM event.
     */
    unmove(event){
        switch(event.code){
            case "KeyW": this._Forward = false;
                break;
            case "KeyS": this._Backward = false;
                break;
            case "KeyA": this._Left = false;
                break;
            case "KeyD": this._Right = false;
                break;
            default:
                break;
        }
    }

    /**
     * @brief Trigger window resize event on the camera
     */
    resize(){
        //update the aspect ratio of the camera
        this.ActiveCamera.aspect = Character.currentAspect();
        this.ActiveCamera.updateProjectionMatrix();
    }

    update(delta){
        //update the velocity based on frame time
        this._Velocity.x -= this._Velocity.x * this._Sensitivity * delta;
        this._Velocity.z -= this._Velocity.z * this._Sensitivity * delta;
        this._Velocity.y -= 9.81 * 10.0 * delta;
        //update the camera position
        this._Direction.z = Number(this._Forward) - Number(this._Backward);
        this._Direction.x = Number(this._Right) - Number(this._Left);
        this._Direction.normalize();

        //compute delta velocity
        if(this._Forward || this._Backward){
            this._Velocity.z -= this._Direction.z * this._Sensitivity * delta;
        }
        if(this._Left || this._Right){
            this._Velocity.x -= this._Direction.x * this._Sensitivity * delta;
        }
        //handle jump
        

    }

};

export {Character};