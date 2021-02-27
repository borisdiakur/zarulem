import { Clock } from 'three'

export function initTick(
	postProcessing,
	randy,
	controls,
	steering,
	turntable,
	car,
	world,
	objectsToUpdate,
	stats
) {
	const clock = new Clock()

	let cnt = 0
	let oldElapsedTime = 0
	const tick = () => {
		stats && stats.begin()

		cnt++

		const elapsedTime = clock.getElapsedTime()
		const deltaTime = elapsedTime - oldElapsedTime
		oldElapsedTime = elapsedTime

		world.step(1 / 200, deltaTime, 3)

		if (cnt % 3 === 0) {
			if (controls) controls.update()

			for (const object of objectsToUpdate) {
				object.mesh.position.copy(object.body.position)
				object.mesh.quaternion.copy(object.body.quaternion)
			}
			steering.onTick(deltaTime)
			turntable.onTick(deltaTime)
			car.onTick(deltaTime)

			postProcessing.effectComposer.render()
		}

		window.requestAnimationFrame(tick)

		stats && stats.end()
	}

	tick()
}
