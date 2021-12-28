//GL library
import * as THREE from "./Library/three.module.js";

//Master controller
import {GameManager} from "./Component/GameManager.js";
//Helper
import {switchOverlay} from "./Utility/ChangeOverlay.js";

let Renderer, Scene, DrawHandle;
let Game;

let prevTime = 0;

//Starting function
$(document).ready(function(){
    //setup rendering context
    Renderer = new THREE.WebGLRenderer({ canvas: $("#gl-canvas").get(0), antialias: true });

    Renderer.shadowMap.enabled = true;
    Renderer.shadowMap.type = THREE.VSMShadowMap;

    //setup scene
    Scene = new THREE.Scene();
    Scene.background = new THREE.Color(0xFFFFFF);
    Scene.fog = new THREE.Fog(0xDDDDDD, 1.0, 90.0);
    //lighting
    const indirect = new THREE.AmbientLight(0xFFFFFF, 0.4);
    Scene.add(indirect);
    
    //setup game
    Game = new GameManager(Scene);

    //register player controller
    $(Game.CompPlayer.Controller).on("lock", function(){
        //start playing, hide the instruction screen
        $("#blocker").css("display", "none");
        //reset frametime
        prevTime = performance.now();

        //enable control
        this.enabled = true;

        draw();
    });
    $(Game.CompPlayer.Controller).on("unlock", function(){
        //stop playing, display instruction screen
        $("#blocker").css("display", "block");

        //disable control
        this.enabled = false;

        cancelAnimationFrame(DrawHandle);
    });
    //setup game levels
    $(Game).on("pass", function(){
        //display end game screen
        switchOverlay("menu", "advancement");
        $(this.CompPlayer.Controller).trigger("unlock");
    });
    $(Game.CompPlayer).on("death", function(){
        //handle game over
        switchOverlay("menu", "death");
        $(this.Controller).trigger("unlock");
    });

    //force the canvas to have the same size as the window before starting
    $(window).trigger("resize");
});

//window event
$(window).resize(function(){
    Game.CompPlayer.resize();
    Renderer.setSize(window.innerWidth, window.innerHeight);
});

//keyboard event
$(window).keypress(function(event){
    if(event.code == "KeyV"){
        Game.CompPlayer.switchView();
    }
});

//trigger game start
$("#gameStart").click(function(){
    Game.CompPlayer.Controller.lock();
});
//trigger game level advancement
$("#nextLevel").click(function(){
    //teleport player to the next level
    Game.setLevelStart();

    $("#gameStart").trigger("click");
    switchOverlay("advancement", "menu");
});
//trigger game restart from the current level
$("#gameRestart").click(function(){
    Game.setLevelStart();

    $("#gameStart").trigger("click");
    switchOverlay("death", "menu");
});

function draw(){
    DrawHandle = requestAnimationFrame(draw);

    //frame time logic
    const currentTime = performance.now();
    const deltaTime = (currentTime - prevTime) / 1000.0;//in ms
    prevTime = currentTime;
    //update camera
    Game.update(deltaTime);

    //render the scene
    Renderer.render(Scene, Game.CompPlayer.ActiveCamera);
}