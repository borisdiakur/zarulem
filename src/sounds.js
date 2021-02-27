import { Howl } from 'howler'
import { normalize } from './utils'
import throttle from 'lodash.throttle'

export class Sounds {
	constructor(interactions, gui) {
		this.interactions = interactions
		this.enabled = true
		this.keySound = new Howl({ src: ['key.mp3'] })
		this.leverSound = new Howl({ src: ['lever.mp3'] })
		this.wheelSound = new Howl({ src: ['wheel.mp3'] })
		this.hitSounds = [
			new Howl({ src: ['hit1.mp3'] }),
			new Howl({ src: ['hit2.mp3'] }),
			new Howl({ src: ['hit3.mp3'] }),
			new Howl({ src: ['hit4.mp3'] }),
		]

		this.rotationSound1 = new Howl({ src: ['speed1.mp3'], loop: true })
		this.rotationSound2 = new Howl({ src: ['speed2.mp3'], loop: true })
		this.rotationSound3 = new Howl({ src: ['speed3.mp3'], loop: true })

		if (gui) {
			const gf = gui.addFolder('Sounds')
			gf.add(this, 'enabled')
		}

		this.playHitSoundThrottled = throttle(
			(impactStrength) => {
				if (!this.enabled) return
				if (impactStrength > 1.5) {
					const randomHitSound = this.hitSounds[
						Math.floor(Math.random() * this.hitSounds.length)
					]
					randomHitSound.volume = normalize(
						impactStrength,
						Math.max(impactStrength, 10),
						0
					)
					randomHitSound.play()
				}
			},
			200,
			{
				trailing: false,
			}
		)
	}

	playHitSound(impactStrength) {
		if (!this.enabled) return
		if (this.interactions.blocked) return
		this.playHitSoundThrottled(impactStrength)
	}

	playKeySound() {
		if (!this.enabled) return
		if (this.interactions.blocked) return
		this.keySound.play()
	}

	playLeverSound() {
		if (!this.enabled) return
		if (this.interactions.blocked) return
		this.leverSound.play()
	}

	playWheelSound() {
		if (!this.enabled) return
		if (this.interactions.blocked) return
		this.wheelSound.play()
	}

	playRotationSound(speed) {
		if (!this.enabled) return
		if (this.interactions.blocked) return
		this.rotationSound1.pause()
		this.rotationSound2.pause()
		this.rotationSound3.pause()
		if (speed > 0 && speed < 4) {
			const speedSound = this['rotationSound' + speed]
			speedSound.play()
		}
	}
}
