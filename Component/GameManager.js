//Physics engine
import * as CANNON from "../Library/cannon-es.js";

//Game components
import {Character} from "./Character.js";
import {Ground} from "./Ground.js";
import {House} from "./House.js";

const TimeStep = 1.0 / 60.0;

/**
 * @brief GameManager handles all components in a game scene.
 */
class GameManager{
    World = new CANNON.World();

    //Game component
    CompPlayer = new Character();
    CompGround = new Ground();

    constructor(scene){
        //Tweak contact properties.
        //Contact stiffness - use to make softer/harder contacts
        this.World.defaultContactMaterial.contactEquationStiffness = 1e9;
        //Stabilization time in number of timesteps
        this.World.defaultContactMaterial.contactEquationRelaxation = 4;

        const solver = new CANNON.GSSolver();
        solver.iterations = 8;
        solver.tolerance = 0.05;
        this.World.solver = new CANNON.SplitSolver(solver);

        this.World.gravity.set(0.0, -9.81, 0.0);

        this.World.broadphase = new CANNON.SAPBroadphase(this.World);
        this.World.broadphase.useBoundingBox = true;

        //initialise all game components
        this.CompGround.addToWorld(scene, this.World);
        this.CompPlayer.addToWorld(scene, this.World);
    }

    /**
     * Update each game component and prepare for rendering the next frame.
     * @param {number} delta The frame time.
     */
    update(delta){
        if(this.CompPlayer.Controller.enabled){
            this.World.step(TimeStep, delta);
        }
        
        this.CompPlayer.update(delta);
    }

};

export {GameManager};