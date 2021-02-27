import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function initControls(canvas, camera, gui) {
	const controls = new OrbitControls(camera, canvas)
	controls.target.set(0, 1, 0)
	controls.enableDamping = true
	controls.enabled = false

	if (gui) {
		const gf = gui.addFolder('Orbit controls')
		gf.add(controls, 'enabled').name('Orbit controls enabled')
	}

	return controls
}
