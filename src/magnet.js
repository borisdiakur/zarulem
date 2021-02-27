import { Body, Sphere, Spring, Vec3 } from 'cannon-es'

export class Magnet {
	constructor(car, world, gui) {
		const springShape = new Sphere(0.1)
		this.springBody = new Body({ mass: 0 })
		this.springBody.addShape(springShape)
		this.springBody.position.set(car.body.position.x, 0, car.body.position.z)
		this.springBody2 = new Body({ mass: 0 })
		this.springBody2.addShape(springShape)
		this.springBody2.position.set(5, 0, car.body.position.z)
		world.addBody(this.springBody)
		world.addBody(this.springBody2)
		const size = car.shape['geometry'].boundingBox.min.x / 2
		this.spring = new Spring(car.body, this.springBody, {
			localAnchorA: new Vec3(size / 1.5, size, 0),
			localAnchorB: new Vec3(0, 0, 0),
			restLength: 0,
			stiffness: 6000,
			damping: 1000,
		})
		this.spring2 = new Spring(car.body, this.springBody2, {
			localAnchorA: new Vec3(size / 0.25, size, 0),
			localAnchorB: new Vec3(0, 0, 0),
			restLength: 100,
			stiffness: 60,
			damping: 10,
		})

		// Compute the force after each step
		world.addEventListener('postStep', () => {
			if (!car.crashed) {
				this.spring.applyForce()
				this.spring2.applyForce()
			}
		})

		if (gui) {
			const gf = gui.addFolder('Magnet')
			gf.add(this.spring, 'damping')
				.min(0)
				.max(1e5)
				.step(1)
				.name('Spring 1 damping')
			gf.add(this.spring, 'restLength')
				.min(0.1)
				.max(10)
				.step(0.01)
				.name('Spring 1 restLength')
			gf.add(this.spring, 'stiffness')
				.min(0.01)
				.max(1e5)
				.step(1)
				.name('Spring 1 stiffness')
			gf.add(this.springBody.position, 'z')
				.min(4)
				.max(14)
				.step(0.001)
				.name('Spring 1 position z')

			gf.add(this.spring2, 'damping')
				.min(0)
				.max(1e5)
				.step(1)
				.name('Spring 2 damping')
			gf.add(this.spring2, 'restLength')
				.min(0.1)
				.max(10)
				.step(0.01)
				.name('Spring 2 restLength')
			gf.add(this.spring2, 'stiffness')
				.min(0.01)
				.max(1e5)
				.step(1)
				.name('Spring 2 stiffness')
			gf.add(this.springBody2.position, 'x')
				.min(4)
				.max(14)
				.step(0.001)
				.name('Spring 2 position x')
		}
	}
}
