//GL library
import * as THREE from "./Library/three.module.js";

import {Character} from "./Target/Character.js";

let Renderer, Scene, DrawHandle;
let Player = new Character(9.5);

let prevTime = performance.now();

//Starting function
$(document).ready(function(){
    //setup rendering context
    Renderer = new THREE.WebGLRenderer({ canvas: $("gl-canvas").get(0), antialias: true });
    Renderer.shadowMap.enabled = true;

    //setup scene
    Scene = new THREE.Scene();
    Scene.background = new THREE.Color(0xFFFFFF);
    Scene.fog = new THREE.Fog(0xFFFFFF, 1.0, 10.0);

    //setup player
    $(Player.Controller).on("lock", function(){
        //start playing, hide the instruction screen
        $("#blocker").css("display", "none");
        draw();
    });
    $(Player.Controller).on("unlock", function(){
        //stop playing, display instruction screen
        $("#blocker").css("display", "block");
        cancelAnimationFrame(DrawHandle);
    });
});

//keyboard control
$(document).keydown(function(ev){ 
    Player.move(ev);
});
$(document).keyup(function(ev){
    Player.unmove(ev);
});

//window event
$(window).resize(function(){
    Player.resize();
    Renderer.setSize(window.innerWidth, window.innerHeight);
});

//trigger game start
$("#instruction").click(function(){
    Player.Controller.lock();
});

function draw(){
    DrawHandle = requestAnimationFrame(draw);

    //frame time logic
    const currentTime = performance.now();
    const deltaTime = currentTime - prevTime;

    //render the scene
    prevTime = currentTime;
    Renderer.render(Scene, Player.ActiveCamera);
}