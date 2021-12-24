//Model loader
import {
    GLTFLoader
} from "../Library/Loader/GLTFLoader.js";

import {
    Body,
    ConvexPolyhedron,
    Box,
    Vec3
} from "../Library/cannon-es.js";
import {
    Quaternion,
    Vector3
} from "../Library/three.module.js";

/**
 * @brief House is the main map of this game.
 */
class House{

    /**
     * @brief Create the master house map.
     * @param {CANNON.Material} phy_mat The material for the entire house.
     * @param {THREE.Scene} scene The rendering scene to be added.
     * @param {CANNON.World} world The physics world to be added.
     * 
     */
    constructor(phy_mat, scene, world){
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
                    if(object.isMesh){
                        //rendering configuration
                        object.castShadow = true;
                        object.receiveShadow = true;

                        //physics configuration
                        if(object.name === "Wall"){
                            //TODO: ignore wall for now because it is a concave shape
                            console.warn("Wall geometry is ignored for collision detection.");
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

                        // const attr = object.geometry.attributes;
                        // const rawVertex = attr.position.array;
                        // const rawIndex = object.geometry.index.array;
                        // const rawSize = attr.position.itemSize;
                        
                        // //convert every mesh into a convex hull bounding box
                        // const vertex = [], index = [];
                        // for(var i = 0; i < rawVertex.length; i += rawSize){
                        //     vertex.push(new Vec3(rawVertex[i], rawVertex[i + 1], rawVertex[i + 2]));
                        // }
                        // for(var i = 0; i < rawIndex.length; i += rawSize){
                        //     index.push([rawIndex[i], rawIndex[i + 1], rawIndex[i + 2]]);
                        // }

                        // //construct polyhedron
                        // const housePart = new ConvexPolyhedron({
                        //     vertices: vertex,
                        //     faces: index
                        // });
                        // console.log(housePart);
                        // //add to compound
                        // HouseBody.addShape(housePart, object.position);
                    }
                });

                //add house to the world
                scene.add(house);
                HouseBody.position.copy(house.position);
                world.addBody(HouseBody);
        });
    }
    
};

export {House};