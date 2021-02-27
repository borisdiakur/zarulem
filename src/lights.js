import { AmbientLight, DirectionalLight } from 'three'
import { isHighPerfDevice } from './utils'

export function initLights(scene, gui) {
	const needsMoreLight = !isHighPerfDevice
	const ambientLight = new AmbientLight(0xffeebb, needsMoreLight ? 1.7 : 1)
	scene.add(ambientLight)

	const directionalLight = new DirectionalLight(
		0xffd556,
		needsMoreLight ? 1.8 : 1
	)
	directionalLight.castShadow = true

	// shadow quality
	directionalLight.shadow.mapSize.set(2048, 2048)
	directionalLight.shadow.normalBias = 0.05 // removes shadow acne

	directionalLight.shadow.camera.far = 80
	directionalLight.shadow.camera.left = -7
	directionalLight.shadow.camera.top = 7
	directionalLight.shadow.camera.right = 7
	directionalLight.shadow.camera.bottom = -7
	directionalLight.shadow.camera.left = -30
	directionalLight.shadow.camera.right = 30
	directionalLight.shadow.camera.top = 30
	directionalLight.shadow.camera.bottom = -30
	directionalLight.position.set(20, 20, 20)
	scene.add(directionalLight)

	if (gui) {
		const gf = gui.addFolder('Lights')
		gf.add(ambientLight, 'intensity')
			.min(0)
			.max(5)
			.step(0.01)
			.name('Ambient light intensity')
		gf.add(directionalLight, 'intensity')
			.min(0)
			.max(10)
			.step(0.001)
			.name('Directional light intensity')
		gf.add(directionalLight.position, 'x')
			.min(-30)
			.max(30)
			.step(0.001)
			.name('Directional light position X')
		gf.add(directionalLight.position, 'y')
			.min(-30)
			.max(30)
			.step(0.001)
			.name('Directional light position Y')
		gf.add(directionalLight.position, 'z')
			.min(-30)
			.max(30)
			.step(0.001)
			.name('Directional light position Z')
	}
}
