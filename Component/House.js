//Model loader
import {GLTFLoader} from "../Library/Loader/GLTFLoader.js";

/**
 * @brief House is the main map of this game.
 */
class House{
    _HouseLoader = new GLTFLoader();
    
    /**
     * @brief Create the master house map.
     * @param {Scene} scene The rendering scene where the house model will be added to
     */
    constructor(scene){
        //load model into the scene
        this._HouseLoader.setPath("./Resource/")
            .load("house.glb", function(model){
                //traverse model hierachy
                model.scene.traverse(function(node){
                    if(node.isMesh){

                    }
                });

                //add model to scene
                scene.add(model.scene);
        });
    }
    
};

export {House};