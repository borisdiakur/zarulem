import { Vector3 } from 'three'
import gsap from 'gsap'

export class Speed {
	constructor(lever, joystick, head, sounds, interactions, keys) {
		this.interactions = interactions
		this.keys = keys
		this.turntable = null
		this.car = null
		this.ignition = null
		this.current = 0
		this.sounds = sounds
		this.lever = lever
		this.head = head

		joystick.onClickUp = this.shift.bind(this, 1)
		joystick.onClickDown = this.shift.bind(this, -1)

		document.addEventListener('keydown', (event) => {
			if (this.interactions.blocked) return
			if (event.key === 'ArrowUp') {
				event.preventDefault()
				event.stopImmediatePropagation()
			}
			if (event.key === 'ArrowDown') {
				event.preventDefault()
				event.stopImmediatePropagation()
			}
		})

		document.addEventListener('keyup', (event) => {
			if (this.interactions.blocked) return
			if (event.key === 'ArrowUp') {
				this.shift(1)
				event.preventDefault()
				event.stopImmediatePropagation()
			}
			if (event.key === 'ArrowDown') {
				this.shift(-1)
				event.preventDefault()
				event.stopImmediatePropagation()
			}
		})
	}

	shift(by) {
		const afterShift = this.current + by
		if (afterShift < 0 || afterShift > 3) return

		this.sounds.playLeverSound()

		this.current = afterShift
		const self = this
		this.on = !this.on
		const from = Number(this.on)
		const to = 1 - from
		const transformationObj = { from }

		if (!this.car.crashed) {
			if (this.ignition.on) {
				if (this.current === 0) {
					this.keys.hintUp()
				} else {
					this.keys.dim()
				}
			} else {
				this.keys.hintEnter()
			}
		}

		this.sounds.playRotationSound(this.ignition.on ? this.current : 0)

		this.head.moveOnSpeedLeverShift(by, this.ignition.on ? this.current : 0)

		gsap.ticker.add(rotateLever)

		function rotateLever() {
			self.lever.rotateOnAxis(
				new Vector3(0, 0, by > 0 ? -1 : 1).normalize(),
				0.05 * Math.abs(by)
			)
		}

		gsap.to(transformationObj, {
			duration: 0.1,
			from: to,
			onComplete: () => {
				gsap.ticker.remove(rotateLever)
				self.lever.rotation.z = -0.25 * this.current
			},
		})

		if (this.turntable) {
			this.turntable.onChangeSpeed(this.ignition.on ? this.current : 0)
		}
		if (this.car) {
			this.car.onChangeSpeed(this.ignition.on ? this.current : 0)
		}
	}

	setTurntable(turntable) {
		this.turntable = turntable
	}
	setCar(car) {
		this.car = car
	}
	setIgnition(ignition) {
		this.ignition = ignition
	}
}
