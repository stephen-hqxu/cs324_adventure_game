import * as THREE from '../Library/three.module.js'
import * as CANNON from '../Library/cannon-es.js'

/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
class PointerLockControlsCannon extends THREE.EventDispatcher {
  constructor(camera, cannonBody, onDeath) {
    super()

    this.enabled = false

    this.cannonBody = cannonBody

    // var eyeYPos = 2 // eyes are 2 meters above the ground
    this.velocityFactor = 0.1
    this.jumpVelocity = 6

    this.pitchObject = new THREE.Object3D()
    this.pitchObject.add(camera)

    this.yawObject = new THREE.Object3D()
    this.yawObject.position.y = 10
    this.yawObject.add(this.pitchObject)

    this.quaternion = new THREE.Quaternion()

    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false

    this.canJump = false

    this.lastAltitude = this.getObject().position.y;
    this.lastContact = null;

    const contactNormal = new CANNON.Vec3() // Normal in the contact, pointing *out* of whatever the player touched
    const upAxis = new CANNON.Vec3(0, 1, 0)
    this.cannonBody.addEventListener('collide', (event) => {
      const { contact } = event

      // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
      // We do not yet know which one is which! Let's check.
      if (contact.bi.id === this.cannonBody.id) {
        // bi is the player body, flip the contact normal
        contact.ni.negate(contactNormal)
      } else {
        // bi is something else. Keep the normal as it is
        contactNormal.copy(contact.ni)
      }

      // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
      if (contactNormal.dot(upAxis) > 0.5) {
        // Use a "good" threshold value between 0 and 1 here!
        this.canJump = true
      }

      //calculate distance fallen
      const currentAltitude = this.getObject().position.y;
      const deltaAltitude = this.lastAltitude - currentAltitude;
      if(deltaAltitude > 3.5){
        //the object is falling from a large distance
        //the number is the death treshold
        onDeath();
      }
      //update altitude
      this.lastAltitude = currentAltitude;

      //record the body being collided
      this.lastContact = contact.bj.id;
    })

    this.velocity = this.cannonBody.velocity

    // Moves the camera to the cannon.js object position and adds velocity to the object if the run key is down
    this.inputVelocity = new THREE.Vector3()
    this.euler = new THREE.Euler()

    this.lockEvent = { type: 'lock' }
    this.unlockEvent = { type: 'unlock' }

    this.connect()
  }

  connect() {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('pointerlockchange', this.onPointerlockChange)
    document.addEventListener('pointerlockerror', this.onPointerlockError)
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  disconnect() {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('pointerlockchange', this.onPointerlockChange)
    document.removeEventListener('pointerlockerror', this.onPointerlockError)
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  dispose() {
    this.disconnect()
  }

  lock() {
    document.body.requestPointerLock()
  }

  unlock() {
    document.exitPointerLock()
  }

  onPointerlockChange = () => {
    if (document.pointerLockElement) {
      this.dispatchEvent(this.lockEvent)

      this.isLocked = true
    } else {
      this.dispatchEvent(this.unlockEvent)

      this.isLocked = false
    }
  }

  onPointerlockError = () => {
    console.error('PointerLockControlsCannon: Unable to use Pointer Lock API')
  }

  onMouseMove = (event) => {
    if (!this.enabled) {
      return
    }

    const { movementX, movementY } = event

    this.yawObject.rotation.y -= movementX * 0.002
    this.pitchObject.rotation.x -= movementY * 0.002

    this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x))
  }

  onKeyDown = (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true
        break

      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true
        break

      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true
        break

      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true
        break

      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpVelocity
        }
        this.canJump = false
        break
    }
  }

  onKeyUp = (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false
        break

      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false
        break

      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false
        break

      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false
        break
    }
  }

  getObject() {
    return this.yawObject
  }

  getDirection() {
    const vector = new CANNON.Vec3(0, 0, -1)
    vector.applyQuaternion(this.quaternion)
    return vector
  }

  update(delta) {
    if (this.enabled === false) {
      return
    }

    delta *= 100

    this.inputVelocity.set(0, 0, 0)

    if (this.moveForward) {
      this.inputVelocity.z = -this.velocityFactor * delta
    }
    if (this.moveBackward) {
      this.inputVelocity.z = this.velocityFactor * delta
    }

    if (this.moveLeft) {
      this.inputVelocity.x = -this.velocityFactor * delta
    }
    if (this.moveRight) {
      this.inputVelocity.x = this.velocityFactor * delta
    }

    // Convert velocity to world coordinates
    this.euler.x = this.pitchObject.rotation.x
    this.euler.y = this.yawObject.rotation.y
    this.euler.order = 'XYZ'
    this.quaternion.setFromEuler(this.euler)
    this.inputVelocity.applyQuaternion(this.quaternion)

    // Add to the object
    this.velocity.x += this.inputVelocity.x
    this.velocity.z += this.inputVelocity.z

    this.yawObject.position.copy(this.cannonBody.position)
  }

  /**
   * @brief Register a world listener that checks if the body is still in contact with the target.
   * @param {CANNON.World} world The world with the body added.
   */
  registerWorld(world){
    //when the body is no longer in contact with the target, i.e., in the air
    world.addEventListener("endContact", (event) => {
      //make sure we are checking the controlling body
      if((event.bodyA === this.cannonBody && event.bodyB.id === this.lastContact) || 
        (event.bodyA.id === this.lastContact && event.bodyB === this.cannonBody)){
          //update altitude
          //this is to make sure when the character is moving downhill the altitude is correct when it leaves the ground
          this.lastAltitude = this.getObject().position.y;
      }
    });
  }
}

export { PointerLockControlsCannon }
