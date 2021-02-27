import { PerspectiveCamera, Vector3 } from 'three'
import gsap from 'gsap'

export class Head {
	constructor(scene, sizes, gui) {
		this.cameraZoomFactor = 1
		this.camera = new PerspectiveCamera(25, sizes.width / sizes.height, 10, 250)
		this.camera.position.x = 75
		this.camera.position.z = -5
		this.cameraPositionZ = this.camera.position.z
		this.cameraPositionX = this.camera.position.x
		this.currentSpeed = 0
		this.cameraMovementIntensitySpeed = 0.5
		this.cameraMovementDurationSpeed = 1.5
		this.cameraMovementDelaySpeed = 0.05
		this.cameraZoomIntensitySpeed = 0.005
		this.cameraMovementIntensitySteering = 3
		this.cameraRotationIntensitySteering = 1
		this.cameraMovementDurationSteering = 1
		this.cameraMovementDelaySteering = 0.025
		this.onResize(sizes)
		this.camera.lookAt(new Vector3(0, 0, 0))
		this.cameraPositionZ = this.camera.position.z
		this.cameraPositionX = this.camera.position.x
		this.cameraPositionY = this.camera.position.y
		scene.add(this.camera)

		if (gui) {
			const gf = gui.addFolder('Camera')
			const gfBase = gf.addFolder('Base')
			gfBase
				.add(this.camera, 'near')
				.min(0.1)
				.max(2000)
				.step(0.01)
				.name('Camera near')
				.onChange(() => {
					this.camera.updateProjectionMatrix()
				})
			gfBase
				.add(this.camera, 'far')
				.min(1)
				.max(2000)
				.step(0.01)
				.name('Camera far')
				.onChange(() => {
					this.camera.updateProjectionMatrix()
				})
			gfBase
				.add(this, 'cameraZoomFactor')
				.min(0.1)
				.max(2)
				.step(0.001)
				.name('Camera zoom factor')
				.onChange(() => {
					this.camera.zoom = this.cameraZoomFactor
					this.camera.updateProjectionMatrix()
				})
			gfBase
				.add(this.camera.position, 'x')
				.min(-200)
				.max(200)
				.step(0.01)
				.name('Camera position X')
			gfBase
				.add(this.camera.position, 'y')
				.min(-200)
				.max(200)
				.step(0.01)
				.name('Camera position Y')
			gfBase
				.add(this.camera.position, 'z')
				.min(-200)
				.max(200)
				.step(0.01)
				.name('Camera position Z')

			const gfSteering = gf.addFolder('Steering')
			gfSteering
				.add(this, 'cameraMovementIntensitySteering')
				.min(0)
				.max(5)
				.step(0.001)
				.name('Camera movement intensity')
			gfSteering
				.add(this, 'cameraRotationIntensitySteering')
				.min(0)
				.max(5)
				.step(0.001)
				.name('Camera rotation intensity')
			gfSteering
				.add(this, 'cameraMovementDurationSteering')
				.min(0)
				.max(5)
				.step(0.001)
				.name('Camera movement duration')
			gfSteering
				.add(this, 'cameraMovementDelaySteering')
				.min(0)
				.max(2)
				.step(0.001)
				.name('Camera movement delay')

			const gfSpeed = gf.addFolder('Speed')
			gfSpeed
				.add(this, 'cameraMovementIntensitySpeed')
				.min(0)
				.max(5)
				.step(0.001)
				.name('Camera movement intensity')
			gfSpeed
				.add(this, 'cameraMovementDurationSpeed')
				.min(0)
				.max(5)
				.step(0.001)
				.name('Camera movement duration')
			gfSpeed
				.add(this, 'cameraMovementDelaySpeed')
				.min(0)
				.max(2)
				.step(0.001)
				.name('Camera movement delay')
			gfSpeed
				.add(this, 'cameraZoomIntensitySpeed')
				.min(0)
				.max(0.2)
				.step(0.001)
				.name('Camera zoom intensity')
		}
	}

	connectToWheel(wheel) {
		this.wheel = wheel
	}

	moveOnSpeedLeverShift(changeSpeedBy, currentSpeed) {
		this.currentSpeed = currentSpeed

		gsap.to(this.camera.position, {
			x:
				this.cameraPositionX -
				Math.pow(currentSpeed, 2.5) * this.cameraMovementIntensitySpeed,
			y:
				this.cameraPositionY -
				Math.pow(currentSpeed, 2.5) * this.cameraMovementIntensitySpeed * 0.5,
			duration:
				this.cameraMovementDurationSpeed * (changeSpeedBy > 0 ? 0.5 : 1.5),
			delay: this.cameraMovementDelaySpeed * (4 - currentSpeed) * 0.5,
			overwrite: 'auto',
			ease: 'power1.inOut',
		})

		const self = this
		function lookAtCenter() {
			self.camera.lookAt(
				new Vector3(
					0,
					0,
					self.wheel.rotation.x * self.cameraRotationIntensitySteering * 0.3
				)
			)
		}
		gsap.ticker.add(lookAtCenter)
		gsap.to(this.camera, {
			zoom:
				this.cameraZoomFactor +
				Math.pow(currentSpeed, 2) * this.cameraZoomIntensitySpeed,
			duration: this.cameraMovementDurationSpeed,
			delay: this.cameraMovementDelaySpeed * (4 - currentSpeed) * 0.5,
			overwrite: 'auto',
			ease: 'power1.inOut',
			onUpdate: () => {
				this.camera.updateProjectionMatrix()
			},
			onComplete: () => {
				gsap.ticker.remove(lookAtCenter)
			},
		})
	}

	moveOnWheelTurn(currentAngle, isIntensityIncreasing, wheelRotation) {
		const duration =
			this.cameraMovementDurationSteering -
			Math.abs(currentAngle) * 0.3 * (isIntensityIncreasing ? 1 : 2)

		gsap.to(this.camera.position, {
			z:
				this.cameraPositionZ +
				currentAngle * this.cameraMovementIntensitySteering,
			duration,
			delay: this.cameraMovementDelaySteering,
			overwrite: 'auto',
			ease: 'power1.inOut',
		})

		const self = this
		function lookAtCenter() {
			self.camera.lookAt(
				new Vector3(
					0,
					0,
					wheelRotation.x * self.cameraRotationIntensitySteering * 0.3
				)
			)
		}
		gsap.ticker.add(lookAtCenter)
		const transformationObj = {
			from: 0,
		}
		const to = -wheelRotation.x * this.cameraRotationIntensitySteering
		gsap.to(transformationObj, {
			from: to,
			duration,
			delay: this.cameraMovementDelaySteering,
			overwrite: 'auto',
			ease: 'power1.inOut',
			onComplete: () => {
				gsap.ticker.remove(lookAtCenter)
			},
		})
	}

	onResize(sizes) {
		this.camera.aspect = sizes.width / sizes.height
		this.cameraZoomFactor = Math.pow(this.camera.aspect, 0.3) / 1.1
		this.camera.zoom =
			this.cameraZoomFactor +
			Math.pow(this.currentSpeed, 2) * this.cameraZoomIntensitySpeed
		this.camera.position.y = 55 / this.cameraZoomFactor
		this.cameraPositionY = this.camera.position.y
		this.camera.updateProjectionMatrix()
	}

	enter() {
		const targetY = this.cameraPositionY
		const targetZ = this.cameraPositionZ
		this.camera.position.y = this.cameraPositionY + 40
		this.camera.position.z = this.cameraPositionZ - 20
		gsap.to(this.camera.position, {
			y: targetY,
			z: targetZ,
			duration: 2,
			delay: this.cameraMovementDelaySteering,
			overwrite: 'auto',
			ease: 'power1.inOut',
		})
	}
}
