//Model loader
import {
    GLTFLoader
} from "../Library/Loader/GLTFLoader.js";

import {
    Body,
    Trimesh,
    Box,
    Sphere,
    Vec3
} from "../Library/cannon-es.js";
import {
    Quaternion,
    Vector3,
    Vector2,
    DoubleSide
} from "../Library/three.module.js";

/**
 * @brief House is the main map of this game.
 */
class House{
    Level = {};
    //level target is a ghost object that does not collide but only triggers collision event when player reaches this area
    LevelTarget = new Body({
        mass: 0.0,
        collisionResponse: false
    });

    /**
     * @brief Create the master house map.
     * @param {CANNON.Material} phy_mat The material for the entire house.
     * @param {THREE.Scene} scene The rendering scene to be added.
     * @param {CANNON.World} world The physics world to be added.
     * @param {any} onFinish A callback function to be called when the model loading is done.
     * 
     */
    constructor(phy_mat, scene, world, onFinish){
        //load model as a group and store it.
        const houseLoader = new GLTFLoader();
        houseLoader.setPath("./Resource/")
            .load("house.glb", (model) => {
                const house = model.scene;
                //move the house above the ground slightly to avoid z-fighting
                house.scale.multiplyScalar(10.0);
                house.position.y += 0.05;
                
                //traverse the group in order to obtain vertices and indices
                let HouseBody = new Body({
                    mass: 0.0,
                    material: phy_mat
                });
                house.traverse((object) => {
                    //handle different object types
                    if(object.isMesh){
                        //rendering configuration
                        object.castShadow = true;
                        object.receiveShadow = true;
                        //no face culling for imported model
                        object.material.side = DoubleSide;

                        //physics configuration
                        if(object.name === "Wall"){
                            //wall is very special, it's non-convex
                            //there are ways to setup collision detection for this shape, for example by constructing a triangular mesh (like a torus).
                            //however with such a large number of vertex it degrades the performance significantly.
                            console.warn("Wall collision is not enabled.");
                            return;
                        }
                        
                        //calculate the bounding box of the current part of the model
                        object.geometry.computeBoundingBox();
                        const BB = object.geometry.boundingBox;
                        const extent = new Vec3(
                            BB.max.x - BB.min.x,
                            BB.max.y - BB.min.y,
                            BB.max.z - BB.min.z
                        );

                        //compute world offset and orientation
                        const offset = new Vector3(0.0, 0.0, 0.0), 
                            orientation = new Quaternion(0.0, 0.0, 0.0, 0.0),
                            scale = new Vector3(0.0, 0.0, 0.0);
                        object.getWorldPosition(offset);
                        object.getWorldQuaternion(orientation);
                        object.getWorldScale(scale);
                        
                        //scale the bounding box to world scale
                        extent.scale(0.5, extent);//CANNON uses half extent for the bounding box so we scale it by 0.5
                        extent.vmul(scale, extent);
                        //clamp the extent so components are non-zero
                        extent.x = Math.max(0.1, extent.x);
                        extent.y = Math.max(0.1, extent.y);
                        extent.z = Math.max(0.1, extent.z);

                        //create AABB collision box
                        const partShape = new Box(extent);
                        //compound this shape
                        HouseBody.addShape(partShape, offset, orientation);

                    }else if(object.isLight){
                        object.castShadow = true;

                        const shadow = object.shadow;
                        shadow.blurSamples = 8;
                        shadow.radius = 8.0;
                        shadow.mapSize = new Vector2(1024, 1024);

                        const camera = object.shadow.camera;
                        camera.left = -100;
                        camera.right = 100;
                        camera.top = -100;
                        camera.bottom = 100;
                        camera.near = 10;
                        camera.far = 200;

                    }else{
                        //handle some dummy objects
                        const objName = object.name;

                        //game level marker
                        if(objName.match("^(Level).[0-9]*(Start|End)")){
                            //attempt to convert from model to world space for the current object.
                            const levelWorld = new Vector3();
                            object.getWorldPosition(levelWorld);

                            this.Level[objName] = levelWorld;

                            if(objName.match("(End)$")){
                                //this dummy object indicates the target of the level end
                                const target = new Sphere(0.2);

                                this.LevelTarget.addShape(target, levelWorld);
                            }
                        }
                    }
                });

                //add house to the world
                scene.add(house);

                HouseBody.position.copy(house.position);
                this.LevelTarget.position.copy(house.position);

                world.addBody(HouseBody);
                world.addBody(this.LevelTarget);

                onFinish();
        });
    }
    
    /**
     * @brief Get the start and end coordinate in world space of a level.
     * @param {number} level The number representing the level. Must be greater than 1.
     * @returns A pair of coordinates denoting starting and ending coordinate.
     */
    getLevelCoordinate(level){
        const levelName = "Level" + String(level);
        const levelStart = levelName + "Start", levelEnd = levelName + "End";

        //check if the level is valid
        if(levelStart in this.Level && levelEnd in this.Level){
            return [this.Level[levelStart], this.Level[levelEnd]];
        }
        //invalid level
        console.error("Level \'" + level + "\' is invalid");
        
    }
    
};

export {House};