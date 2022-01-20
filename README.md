# cs324_adventure_game

Year 3 Computer Graphics Coursework

## Library

- [three.js](https://github.com/mrdoob/three.js)
- [cannon-es](https://github.com/pmndrs/cannon-es)
- [jQuery](https://jquery.com/)

## How to run

This tiny game is written in WebGL. To run this on your local web browser, you need to run a web server to be able to load resource from local hard drive.

### Resource

To reduce repositry size, external libraries and assets are not included. You should create a `Library` folder in the root directory and inside the newly created foler, create another folder `Loader`, and now place files as following:

- Loader
  - [*GLTFLoader.js*](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/GLTFLoader.js)
- *cannon-es.js*
- *three.module.js*

The application was developed based on **three.js release 136** and **cannon-es version 0.19.0**. jQuery is loaded from CDN directly so no local installation is required, however it is required to have internet connection.

For assets, The *Resource* directory already contains some texture, however the majority of the game is built based on a pre-modelled map, which can be downloaded [here](https://github.com/stephen-hqxu/cs324_adventure_game/releases) and placed under this directory. This map is made by myself using *Blender* and distributed under *Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License*.

> The source of texture used in this project is downloaded from [here](https://ambientcg.com/k).

Depending on the type of web server you are running, you may need to modify the accessiblility of all files under *Resource* folder to allow read from external users.