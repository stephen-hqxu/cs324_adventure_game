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

    //Physics material
    MatPlayer = new CANNON.Material("Player");
    MatGround = new CANNON.Material("Ground");
    MatObstacle = new CANNON.Material("Obstacle");

    //Game component
    CompPlayer = new Character(this.MatPlayer);
    CompGround = new Ground(this.MatGround);
    CompHouse;

    //game level stuff
    currentLevel = 1;

    constructor(scene){
        //Tweak contact properties.
        //Contact stiffness - use to make softer/harder contacts
        this.World.defaultContactMaterial.contactEquationStiffness = 1e5;
        //Stabilization time in number of timesteps
        this.World.defaultContactMaterial.contactEquationRelaxation = 4;

        const solver = new CANNON.GSSolver();
        solver.iterations = 8;
        solver.tolerance = 0.1;
        this.World.solver = new CANNON.SplitSolver(solver);

        this.World.gravity.set(0.0, -9.81, 0.0);

        this.World.broadphase = new CANNON.SAPBroadphase(this.World);
        this.World.broadphase.useBoundingBox = true;

        //register material contact
        this.World.addContactMaterial(new CANNON.ContactMaterial(this.MatPlayer, this.MatGround, {
            friction: 1.2,
            restitution: 0.3
        }));
        this.World.addContactMaterial(new CANNON.ContactMaterial(this.MatPlayer, this.MatObstacle, {
            friction: 0.5,
            restitution: 0.5
        }));

        //initialise all game components
        this.CompGround.addToWorld(scene, this.World);
        this.CompPlayer.addToWorld(scene, this.World);
        this.CompHouse = new House(this.MatObstacle, scene, this.World, () => {
            //register end of level event
            $(this.CompHouse.LevelTarget).on("collide", (event) => {
                //player passes the current level
                $(this).trigger("pass", {
                    levelPassed: this.currentLevel
                });
                //advance to the next level.
                this.currentLevel++;
            });

            //start the game
            this.setLevelStart();
        });
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

    /**
     * @brief Set the character location to the start of the current level.
     */
    setLevelStart(){
        $("#levelLabel").text("- Level " + this.currentLevel + " -");
        this.CompPlayer.CharBody.position.copy(this.CompHouse.getLevelCoordinate(this.currentLevel)[0]);
    }

};

export {GameManager};