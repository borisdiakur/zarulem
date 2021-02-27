import { Group, Vector3 } from 'three'
import { Vec3 } from 'cannon-es'

export class Turntable {
	constructor(scene, turntableItems, turntableBody, gearwheel, gui) {
		this.groupTurntable = new Group()
		this.currentGear = 0
		this.currentAngle = 0
		this.maxSpeed = 2
		this.gearwheel = gearwheel
		this.gearwheelAngle = 0
		this.body = turntableBody
		this.axis = new Vec3(0, 1, 0)
		for (const item of turntableItems) {
			this.groupTurntable.add(item)
		}
		scene.add(this.groupTurntable)

		if (gui) {
			const gf = gui.addFolder('Turntable')
			gf.add(this, 'maxSpeed').min(0).max(10).step(0.001).name('Max speed')
		}
	}

	onChangeSpeed(gear) {
		this.currentGear = gear
	}

	onTick(deltaTime) {
		this.currentAngle =
			(this.currentAngle + this.currentGear * this.maxSpeed * deltaTime) %
			(Math.PI * 2)
		this.body.quaternion.setFromAxisAngle(this.axis, this.currentAngle)

		if (this.currentGear > 0) {
			this.gearwheelAngle += 0.1
			this.gearwheel.rotateOnAxis(
				new Vector3(0, 1, 0).normalize(),
				this.gearwheelAngle
			)
		}
	}
}
