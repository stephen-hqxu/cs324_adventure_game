//GL library
import * as THREE from "./Library/three.module.js";

//Master controller
import {GameManager} from "./Component/GameManager.js";

let Renderer, Scene, DrawHandle;
let Game;

let prevTime = 0;

//Starting function
$(document).ready(function(){
    //setup rendering context
    Renderer = new THREE.WebGLRenderer({ canvas: $("#gl-canvas").get(0), antialias: true });

    Renderer.shadowMap.enabled = true;
    Renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //setup scene
    Scene = new THREE.Scene();
    Scene.background = new THREE.Color(0xFFFFFF);
    Scene.fog = new THREE.Fog(0xDDDDDD, 1.0, 90.0);
    //lighting
    const indirect = new THREE.AmbientLight(0xFFFFFF, 0.4);
    Scene.add(indirect);
    const sun = new THREE.DirectionalLight(0xF5DFC1, 2.5);
    sun.castShadow = true;
    sun.shadow.camera.near = 1.0;
    sun.shadow.camera.far = 1000.0;
    sun.shadow.bias = 0.01;
    sun.position.set(92.0, 15.0, -61.5);
    Scene.add(sun);
    
    //setup game
    Game = new GameManager(Scene);
    const Player = Game.CompPlayer;

    //register player controller
    $(Player.Controller).on("lock", function(){
        //start playing, hide the instruction screen
        $("#menu").css("display", "none");
        //reset frametime
        prevTime = performance.now();

        //enable control
        Player.Controller.enabled = true;

        draw();
    });
    $(Player.Controller).on("unlock", function(){
        //stop playing, display instruction screen
        $("#menu").css("display", "flex");

        //disable control
        Player.Controller.enabled = false;

        cancelAnimationFrame(DrawHandle);
    });
    //setup game map

    //force the canvas to have the same size as the window before starting
    $(window).trigger("resize");
});

//window event
$(window).resize(function(){
    Game.CompPlayer.resize();
    Renderer.setSize(window.innerWidth, window.innerHeight);
});

//trigger game start
$("#gameStart").click(function(){
    Game.CompPlayer.Controller.lock();
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