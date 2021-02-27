export class Keys {
	constructor() {
		this.keys = document.getElementById('keys')
		this.keyEnter = document.getElementById('key-enter')
		this.keySpace = document.getElementById('key-space')
		this.keyUp = document.getElementById('key-up')
		this.allKeys = [this.keys, this.keyEnter, this.keySpace, this.keyUp]
	}

	enter() {
		this.keys.style.opacity = '1'
	}

	stopHinting() {
		for (const key of this.allKeys) {
			key.classList.remove('key--hinting')
		}
	}

	hintEnter() {
		this.stopHinting()
		this.undim()
		this.keyEnter.classList.add('key--hinting')
	}
	hintSpace() {
		this.stopHinting()
		this.undim()
		this.keySpace.classList.add('key--hinting')
	}
	hintUp() {
		this.stopHinting()
		this.undim()
		this.keyUp.classList.add('key--hinting')
	}

	dim() {
		this.stopHinting()
		this.keys.style.opacity = '0.5'
	}
	undim() {
		this.keys.style.opacity = '1'
	}
}
