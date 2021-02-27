import { Euler } from 'three'

export class Steering {
	constructor(
		canvas,
		wheel,
		head,
		joystick,
		controls,
		sounds,
		interactions,
		gui
	) {
		this.canvas = canvas
		this.interactions = interactions
		this.magnet = null
		this.speed = null
		this.sounds = sounds
		this.wheel = wheel
		this.head = head
		this.joystick = joystick
		this.intensity = 0
		this.direction = 0
		this.prevAngle = 0
		this.currentAngle = 0
		this.isPointerActive = false
		this.isIntensityIncreasing = false
		this.changeFactor = 1.75
		this.changePotency = 1.25
		this.enabled = true

		if (gui) {
			const gf = gui.addFolder('Steering')
			gf.add(this, 'enabled')
				.name('Steering enabled')
				.onChange(() => {
					controls.enabled = !this.enabled
				})
			gf.add(this, 'changeFactor')
				.min(0)
				.max(10)
				.step(0.0001)
				.name('Steering change factor')
			gf.add(this, 'changePotency')
				.min(0.5)
				.max(20)
				.step(0.01)
				.name('Steering change potency')
		}

		document.addEventListener('keydown', (event) => {
			if (this.interactions.blocked) return
			if (!this.enabled) return
			if (this.isPointerActive) return
			if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
				event.preventDefault()
				event.stopImmediatePropagation()
				this.isIntensityIncreasing = true

				switch (event.key) {
					case 'ArrowLeft':
						this.direction = -1
						break
					case 'ArrowRight':
						this.direction = 1
						break
				}

				event.preventDefault()
			}
		})

		document.addEventListener('keyup', (event) => {
			if (this.interactions.blocked) return
			if (!this.enabled) return
			if (this.isPointerActive) return
			if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
				event.preventDefault()
				event.stopImmediatePropagation()

				if (
					(event.key === 'ArrowLeft' && this.direction === 1) ||
					(event.key === 'ArrowRight' && this.direction === -1)
				) {
					this.intensity = 0
					return
				}

				this.isIntensityIncreasing = false
				this.direction = 0
				this.intensity = 0
			}
		})

		this.canvas.style.cursor = 'grab'
		window.addEventListener('mousedown', () => {
			if (this.interactions.blocked) return
			if (!this.enabled) return
			this.isPointerActive = true
			this.canvas.style.cursor = 'grabbing'
		})
		window.addEventListener('mouseup', () => {
			if (this.interactions.blocked) return
			if (!this.enabled) return
			this.isPointerActive = false
			this.canvas.style.cursor = 'grab'
		})
		window.addEventListener('mousemove', (event) => {
			if (this.interactions.blocked) return
			if (!this.enabled) return
			if (!this.isPointerActive) return
			this.turnWithPointer(event)
		})
	}

	moveMagnet(forceUpdate = false) {
		if (!this.magnet) return
		const min = 4
		const max = 16
		const pos = min + ((max - min) * (this.currentAngle + 1)) / 2
		this.magnet.springBody.position.z = pos

		if (this.speed && (this.speed.current > 0 || forceUpdate)) {
			setTimeout(() => {
				this.magnet.springBody2.position.z = pos - this.currentAngle + 3
			}, 200 / this.speed.current)
		}
	}

	turnWheel(targetAngle) {
		this.wheel.setRotationFromEuler(new Euler(targetAngle, 0, 0.72, 'YZX'))
		this.currentAngle = targetAngle

		if (
			Math.abs(Math.abs(this.prevAngle) - Math.abs(this.currentAngle)) > 0.3
		) {
			this.sounds.playWheelSound()
			this.head.moveOnWheelTurn(
				this.currentAngle,
				this.isIntensityIncreasing,
				this.wheel.rotation
			)
			this.prevAngle = this.currentAngle
		}

		this.moveMagnet()
	}

	turnWithPointer(event) {
		const targetAngle = Math.max(
			-1,
			Math.min(1, ((event.offsetX / window.innerWidth) * 2 - 1) * -2)
		)
		this.turnWheel(targetAngle)
	}

	turnWithKeys(deltaTime) {
		// update intensity
		// (cos(x^2 * pi * 2) - 1) / -2
		if (this.isIntensityIncreasing) {
			if (this.intensity < 1) {
				this.intensity +=
					this.changeFactor *
					deltaTime *
					Math.pow(2 - this.intensity, this.changePotency)
			} else {
				this.intensity = 1
			}
		} else {
			if (this.intensity > 0) {
				this.intensity -=
					this.changeFactor *
					deltaTime *
					Math.pow(2 - this.intensity, this.changePotency)
			}
		}

		// update rotation
		let targetAngle = this.intensity * -this.direction
		let delta = this.currentAngle
		targetAngle = Math.max(-1, Math.min(1, targetAngle + delta))
		if (targetAngle !== this.currentAngle) this.turnWheel(targetAngle)
	}

	setMagnet(magnet) {
		this.magnet = magnet
	}

	setSpeed(speed) {
		this.speed = speed
		this.moveMagnet(true)
	}

	onTick(deltaTime) {
		if (this.joystick.value.x) {
			this.turnWheel(-this.joystick.value.x)
			return
		}

		if (this.isPointerActive) return
		this.turnWithKeys(deltaTime)
	}
}
