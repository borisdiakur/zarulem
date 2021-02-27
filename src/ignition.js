import { Vector3 } from 'three'
import gsap from 'gsap'

export class Ignition {
	on = true

	constructor(key, sounds, interactions, keys) {
		this.interactions = interactions
		this.keys = keys
		this.key = key
		this.sounds = sounds
		this.speed = null
		this.car = null

		if (this.on) {
			this.key.rotateOnAxis(new Vector3(1, 0, 0).normalize(), -1)
		}

		document.addEventListener('keydown', (event) => {
			if (this.interactions.blocked) return
			if (event.key === 'Enter') {
				event.preventDefault()
				event.stopImmediatePropagation()
			}
		})

		document.addEventListener('keyup', (event) => {
			if (this.interactions.blocked) return
			if (event.key === 'Enter') {
				this.toggle()
				event.preventDefault()
				event.stopImmediatePropagation()
			}
		})
	}

	toggle() {
		const self = this
		this.on = !this.on
		const from = Number(this.on)
		const to = 1 - from
		const transformationObj = { from }

		if (!this.on) {
			this.keys.hintEnter()
		} else {
			if (this.car.crashed) {
				this.keys.hintSpace()
			} else {
				this.keys.stopHinting()
			}
		}

		gsap.ticker.add(rotateKey)

		this.sounds.playKeySound()
		this.speed.shift(0)

		function rotateKey() {
			const rotationDirection =
				self.key.rotation.x >= 0.4
					? -1
					: self.key.rotation.x <= -0.4
					? 1
					: self.on
					? -1
					: 1
			self.key.rotateOnAxis(
				new Vector3(rotationDirection, 0, 0).normalize(),
				0.14
			)
		}

		gsap.to(transformationObj, {
			duration: 0.2,
			from: to,
			onComplete: () => {
				gsap.ticker.remove(rotateKey)
			},
		})
	}

	setSpeed(speed) {
		this.speed = speed
	}

	setCar(car) {
		this.car = car
	}
}
