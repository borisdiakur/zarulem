import { Material, ContactMaterial, World, SAPBroadphase } from 'cannon-es'

export class Physics {
	constructor(gui, scene) {
		this.cannonDebugger = null
		this.world = new World()
		this.scene = scene
		this.world.broadphase = new SAPBroadphase(this.world)
		// this.world.broadphase = new NaiveBroadphase()
		// this.world.gravity.set(0, -9.82, 0)
		this.world.gravity.set(0, -150, 0)
		this.defaultMaterial = new Material('default')
		this.defaultContactMaterial = new ContactMaterial(
			this.defaultMaterial,
			this.defaultMaterial,
			{
				friction: 1e8,
				restitution: 0.5,
				frictionEquationRelaxation: 2.5,
				contactEquationStiffness: 1e8,
				frictionEquationStiffness: 1e4,
				contactEquationRelaxation: 2,
			}
		)
		this.world.addContactMaterial(this.defaultContactMaterial)
		this.world.defaultContactMaterial = this.defaultContactMaterial

		if (gui) {
			const gf = gui.addFolder('World')
			gf.add(this, 'enableCannonDebugger')
			gf.add(this.defaultContactMaterial, 'restitution')
				.min(0)
				.max(10)
				.step(0.001)
			gf.add(this.defaultContactMaterial, 'contactEquationRelaxation')
				.min(0)
				.max(10)
				.step(0.001)
			gf.add(this.defaultContactMaterial, 'contactEquationStiffness')
				.min(0)
				.max(1e8)
				.step(10)
			gf.add(this.defaultContactMaterial, 'frictionEquationRelaxation')
				.min(0)
				.max(10)
				.step(0.001)
			gf.add(this.defaultContactMaterial, 'frictionEquationStiffness')
				.min(0)
				.max(1e4)
				.step(10)
			gf.add(this.defaultContactMaterial, 'friction').min(0).max(1e8).step(10)
		}
	}

	async enableCannonDebugger() {
		if (!this.cannonDebugger) {
			this.cannonDebugger = (await import('cannon-es-debugger')).default
			this.cannonDebugger(this.scene, this.world.bodies)
		}
	}
}
