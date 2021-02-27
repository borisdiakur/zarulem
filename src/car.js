import { Body, Box, HingeConstraint, Vec3 } from 'cannon-es'
import { Vector3 } from 'three'
import throttle from 'lodash.throttle'

export class Car {
	constructor(
		carShape,
		defaultMaterial,
		world,
		sounds,
		interactions,
		joystick,
		keys,
		gui
	) {
		this.interactions = interactions
		this.hasHadInitialImpact = false
		this.joystick = joystick
		this.keys = keys
		this.sounds = sounds
		this.turntable = null
		this.ignition = null
		this.constraint = null
		this.world = world
		this.currentGear = 0
		this.currentAngle = null
		this.axis = new Vec3(0, 1, 0)
		this.crashed = false
		this.shape = carShape
		this.initialPosition = carShape.position.clone()
		this.body = new Body({
			mass: 20,
			linearDamping: 0.001,
			shape: new Box(
				new Vec3(
					carShape['geometry'].boundingBox.min.x,
					carShape['geometry'].boundingBox.getSize(new Vector3()).y / 2,
					carShape['geometry'].boundingBox.min.z
				)
			),
			position: new Vec3(0, 0, 0), // will be overwritten
			material: defaultMaterial,
		})
		this.body.position.copy(carShape.position)
		this.positionY = this.body.position.y
		this.body.position.y = 7
		this.body.quaternion.copy(carShape.quaternion)
		this.initialPosition = this.body.position.clone()
		this.initialQuaternion = this.body.quaternion.clone()
		this.body.addEventListener('collide', this.onCollide.bind(this))
		this.impactStrengthTolerance = 100

		this.onCrashThrottled = throttle(this.onCrash.bind(this), 500, {
			trailing: false,
		})

		if (gui) {
			const gf = gui.addFolder('Car')
			gf.add(this, 'impactStrengthTolerance').min(0).max(100).step(0.001)
		}

		document.addEventListener('keydown', (event) => {
			if (this.interactions.blocked) return
			if (event.key === ' ') {
				event.preventDefault()
				event.stopImmediatePropagation()
			}
		})

		document.addEventListener('keyup', (event) => {
			if (this.interactions.blocked) return
			if (event.key === ' ' && this.crashed) {
				this.resetCar.apply(this)
				event.preventDefault()
				event.stopImmediatePropagation()
			}
		})
		this.joystick.onClickReset = this.resetCar.bind(this)
	}

	setTurntable(turntable) {
		this.turntable = turntable
	}

	setIgnition(ignition) {
		this.ignition = ignition
	}

	resetCar() {
		this.onReset()
		this.body.position.copy(this.initialPosition)
		this.body.quaternion.copy(this.initialQuaternion)
	}

	onReset() {
		if (this.crashed) {
			if (this.currentGear === 0) {
				if (this.ignition.on) {
					this.keys.hintUp()
				} else {
					this.keys.hintEnter()
				}
			} else {
				this.keys.dim()
			}
			this.world.removeConstraint(this.constraint)
			this.constraint = null
			this.body.angularDamping = 0
			this.crashed = false
			this.joystick.onReset()
		}
	}

	onCrash() {
		if (!this.hasHadInitialImpact) {
			this.hasHadInitialImpact = true
			return
		}
		if (this.crashed) return
		this.crashed = true
		this.joystick.onCrash()
		this.keys.hintSpace()
		const worldPoint = this.body.position
		const worldAxis = new Vec3(0, 1, 0)
		const localPivotA = this.body.pointToLocalFrame(worldPoint)
		const localPivotB = this.turntable.body.pointToLocalFrame(worldPoint)
		const localAxisA = this.body.vectorToLocalFrame(worldAxis)
		const localAxisB = this.turntable.body.vectorToLocalFrame(worldAxis)
		if (!this.constraint) {
			this.constraint = new HingeConstraint(this.body, this.turntable.body, {
				pivotA: localPivotA,
				pivotB: localPivotB,
				axisA: localAxisA,
				axisB: localAxisB,
			})
			this.world.addConstraint(this.constraint)
		}
		this.body.angularDamping = 1
	}

	onCollide(event) {
		const impactStrength = event.contact.getImpactVelocityAlongNormal()
		this.sounds.playHitSound(impactStrength)
		if (impactStrength > this.impactStrengthTolerance) {
			this.onCrashThrottled()
		}
	}

	onChangeSpeed(currentGear) {
		this.currentGear = currentGear
	}

	// Rotate car around its local y axis.
	onTick(deltaTime) {
		if (this.body.position.y < 5) {
			this.resetCar()
			return
		}
		if (this.crashed) {
			this.body.position.y = this.positionY
			if (!this.crashAngle) {
				this.crashAngle = this.body.quaternion.y * Math.PI
				return
			}
			this.currentAngle =
				(this.currentAngle + this.currentGear * 2 * deltaTime) % (Math.PI * 2)
			this.body.quaternion.setFromAxisAngle(
				this.axis,
				this.currentAngle + this.crashAngle
			)
		}
	}
}
