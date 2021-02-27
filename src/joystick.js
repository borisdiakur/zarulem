export class Joystick {
	constructor(interactions) {
		this.interactions = interactions
		this.onClickUp = null
		this.onClickDown = null
		this.onClickReset = null

		this.maxDistance = 42 // maximum amount joystick can move in any direction
		this.deadzone = 1 // joystick must move at least this amount from origin to register value change

		this.joy = document.createElement('div')
		this.joy.id = 'joy'
		this.joy.classList.add('joy')
		this.stick = document.createElement('div')
		this.stick.classList.add('stick')
		this.joy.appendChild(this.stick)
		document.body.appendChild(this.joy)

		this.btnReset = document.createElement('div')
		this.btnReset.id = 'btn-reset'
		this.btnReset.classList.add('btn')
		this.btnReset.classList.add('btn--reset')
		document.body.appendChild(this.btnReset)
		this.btnReset.addEventListener(
			'mousedown',
			this.handleBtnResetStart.bind(this)
		)
		this.btnReset.addEventListener(
			'touchstart',
			this.handleBtnResetStart.bind(this)
		)
		this.btnReset.addEventListener('mouseup', this.handleBtnResetEnd.bind(this))
		this.btnReset.addEventListener(
			'touchend',
			this.handleBtnResetEnd.bind(this)
		)

		this.btnUp = document.createElement('a')
		this.btnUp.id = 'btn-up'
		this.btnUp.classList.add('btn')
		this.btnUp.classList.add('btn--up')
		document.body.appendChild(this.btnUp)
		this.btnUp.addEventListener('mousedown', this.handleBtnUpStart.bind(this))
		this.btnUp.addEventListener('touchstart', this.handleBtnUpStart.bind(this))
		this.btnUp.addEventListener('mouseup', this.handleBtnUpEnd.bind(this))
		this.btnUp.addEventListener('touchend', this.handleBtnUpEnd.bind(this))

		this.btnDown = document.createElement('a')
		this.btnDown.id = 'btn-down'
		this.btnDown.classList.add('btn')
		this.btnDown.classList.add('btn--down')
		document.body.appendChild(this.btnDown)
		this.btnDown.addEventListener(
			'mousedown',
			this.handleBtnDownStart.bind(this)
		)
		this.btnDown.addEventListener(
			'touchstart',
			this.handleBtnDownStart.bind(this)
		)
		this.btnDown.addEventListener('mouseup', this.handleBtnDownEnd.bind(this))
		this.btnDown.addEventListener('touchend', this.handleBtnDownEnd.bind(this))

		// location from which drag begins, used to calculate offsets
		this.dragStart = null

		// track touch identifier in case multiple joysticks present
		this.touchId = null

		this.active = false
		this.value = { x: 0, y: 0 }

		this.joy.addEventListener('mousedown', this.handleDown.bind(this))
		this.joy.addEventListener('touchstart', this.handleDown.bind(this))
		this.stick.addEventListener('mousedown', this.handleDown.bind(this))
		this.stick.addEventListener('touchstart', this.handleDown.bind(this))
		document.addEventListener('mousemove', this.handleMove.bind(this), {
			passive: false,
		})
		document.addEventListener('touchmove', this.handleMove.bind(this), {
			passive: false,
		})
		document.addEventListener('mouseup', this.handleUp.bind(this))
		document.addEventListener('touchend', this.handleUp.bind(this))
	}

	handleDown(event) {
		if (this.interactions.blocked) return
		event.stopImmediatePropagation()
		this.active = true
		this.joy.classList.add('joy--active')

		// all drag movements are instantaneous
		this.stick.style.transition = '0s'

		// touch event fired before mouse event; prevent redundant mouse event from firing
		event.preventDefault()

		const stickBCR = this.stick.getBoundingClientRect()

		if (event.changedTouches) {
			const diffX =
				stickBCR.x - event.changedTouches[0].clientX + stickBCR.width / 2
			const diffY =
				stickBCR.y - event.changedTouches[0].clientY + stickBCR.height / 2
			this.dragStart = {
				x: event.changedTouches[0].clientX + diffX,
				y: event.changedTouches[0].clientY + diffY,
			}
		} else {
			const diffX = stickBCR.x - event.clientX + stickBCR.width / 2
			const diffY = stickBCR.y - event.clientY + stickBCR.height / 2
			this.dragStart = { x: event.clientX + diffX, y: event.clientY + diffY }
		}

		// if this is a touch event, keep track of which one
		if (event.changedTouches) this.touchId = event.changedTouches[0].identifier

		this.handleMove(event)
	}

	handleMove(event) {
		if (this.interactions.blocked) return
		if (!this.active) return
		event.stopImmediatePropagation()

		// if this is a touch event, make sure it is the right one
		// also handle multiple simultaneous touchmove events
		let touchmoveId = null
		if (event.changedTouches) {
			for (let i = 0; i < event.changedTouches.length; i++) {
				if (this.touchId == event.changedTouches[i].identifier) {
					touchmoveId = i
					event.clientX = event.changedTouches[i].clientX
					event.clientY = event.changedTouches[i].clientY
				}
			}

			if (touchmoveId == null) return
		}

		const xDiff = event.clientX - this.dragStart.x
		const yDiff = event.clientY - this.dragStart.y
		const angle = Math.atan2(yDiff, xDiff)
		const distance = Math.min(this.maxDistance, Math.hypot(xDiff, yDiff))
		const xPosition = distance * Math.cos(angle)
		const yPosition = distance * Math.sin(angle)

		// move stick to new position
		this.stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`

		// deadzone adjustment
		let distance2 = 0
		if (distance >= this.deadzone) {
			distance2 =
				(this.maxDistance / (this.maxDistance - this.deadzone)) *
				(distance - this.deadzone)
		}
		const xPosition2 = distance2 * Math.cos(angle)
		const yPosition2 = distance2 * Math.sin(angle)
		const xPercent = parseFloat((xPosition2 / this.maxDistance).toFixed(4))
		const yPercent = parseFloat((yPosition2 / this.maxDistance).toFixed(4))

		this.value = { x: xPercent, y: yPercent }
	}

	handleUp(event) {
		if (this.interactions.blocked) return
		if (!this.active) return
		event.stopImmediatePropagation()

		// if this is a touch event, make sure it is the right one
		if (
			event.changedTouches &&
			this.touchId != event.changedTouches[0].identifier
		)
			return

		// transition the joystick position back to center
		this.stick.style.transition = '.2s'
		this.stick.style.transform = `translate3d(0px, 0px, 0px)`

		// reset everything
		this.value = { x: 0, y: 0 }
		this.touchId = null
		this.active = false
		this.joy.classList.remove('joy--active')
	}

	handleBtnUpStart(event) {
		if (this.interactions.blocked) return
		event.preventDefault()
		if (this.onClickUp) this.onClickUp()
		this.btnUp.classList.add('btn--active')
	}
	handleBtnUpEnd(event) {
		if (this.interactions.blocked) return
		event.preventDefault()
		this.btnUp.classList.remove('btn--active')
	}
	handleBtnDownStart(event) {
		if (this.interactions.blocked) return
		event.preventDefault()
		if (this.onClickDown) this.onClickDown()
		this.btnDown.classList.add('btn--active')
	}
	handleBtnDownEnd(event) {
		if (this.interactions.blocked) return
		event.preventDefault()
		this.btnDown.classList.remove('btn--active')
	}
	handleBtnResetStart(event) {
		if (this.interactions.blocked) return
		event.preventDefault()
		if (this.onClickReset) this.onClickReset()
		this.btnDown.classList.add('btn--active')
	}
	handleBtnResetEnd(event) {
		if (this.interactions.blocked) return
		event.preventDefault()
		this.btnDown.classList.remove('btn--active')
	}

	onReset() {
		this.btnReset.classList.remove('btn--visible')
	}
	onCrash() {
		this.btnReset.classList.add('btn--visible')
	}

	enter() {
		this.joy.style.visibility = 'visible'
		this.joy.style.opacity = '1'
		this.btnUp.style.visibility = 'visible'
		this.btnUp.style.opacity = '1'
		this.btnDown.style.visibility = 'visible'
		this.btnDown.style.opacity = '1'
	}
}
