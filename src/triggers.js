import { Box, Vec3, Body } from 'cannon-es'

export class Triggers {
	constructor(world, car, gui) {
		// Trigger body
		const boxShape = new Box(new Vec3(0.2, 2, 7.4))
		this.triggerBodyIn = new Body()
		this.triggerBodyIn.addShape(boxShape)
		this.triggerBodyIn.position.set(2, 7, 9)
		this.triggerBodyInAngle = -0.1
		this.triggerBodyIn.quaternion.setFromAxisAngle(
			new Vec3(0, 1, 0),
			this.triggerBodyInAngle
		)
		this.triggerBodyOut = new Body()
		this.triggerBodyOut.addShape(boxShape)
		this.triggerBodyOut.position.set(-7.8, 7, 7.5)
		this.triggerBodyOutAngle = -0.4
		this.triggerBodyOut.quaternion.setFromAxisAngle(
			new Vec3(0, 1, 0),
			this.triggerBodyOutAngle
		)
		this.triggerBodyIn.addEventListener('collide', (event) => {
			if (event.body === car.body) {
				car.onCrash()
			}
		})
		world.addEventListener('endContact', (event) => {
			if (
				(event.bodyA === car.body && event.bodyB === this.triggerBodyOut) ||
				(event.bodyB === car.body && event.bodyA === this.triggerBodyOut)
			) {
				car.onReset()
			}
		})

		world.addBody(this.triggerBodyIn)
		world.addBody(this.triggerBodyOut)

		if (gui) {
			const gf = gui.addFolder('Triggers')

			gf.add(this.triggerBodyIn.position, 'x')
				.min(-20)
				.max(20)
				.step(0.1)
				.name('Trigger in position x')
			gf.add(this.triggerBodyIn.position, 'y')
				.min(-20)
				.max(20)
				.step(0.1)
				.name('Trigger in position y')
			gf.add(this.triggerBodyIn.position, 'z')
				.min(-20)
				.max(20)
				.step(0.1)
				.name('Trigger in position z')
			gf.add(this, 'triggerBodyInAngle')
				.min(-2)
				.max(2)
				.step(0.001)
				.onChange((angle) => {
					this.triggerBodyIn.quaternion.setFromAxisAngle(
						new Vec3(0, 1, 0),
						angle
					)
				})
				.name('Trigger in angle')

			gf.add(this.triggerBodyOut.position, 'x')
				.min(-20)
				.max(20)
				.step(0.1)
				.name('Trigger out position x')
			gf.add(this.triggerBodyOut.position, 'y')
				.min(-20)
				.max(20)
				.step(0.1)
				.name('Trigger out position y')
			gf.add(this.triggerBodyOut.position, 'z')
				.min(-20)
				.max(20)
				.step(0.1)
				.name('Trigger out position z')
			gf.add(this, 'triggerBodyOutAngle')
				.min(-2)
				.max(2)
				.step(0.001)
				.onChange((angle) => {
					this.triggerBodyOut.quaternion.setFromAxisAngle(
						new Vec3(0, 1, 0),
						angle
					)
				})
				.name('Trigger out angle')
		}
	}
}
