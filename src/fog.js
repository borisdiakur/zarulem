import { Fog } from 'three'

export function initFog(scene, gui) {
	const fog = new Fog(0xffeebb, 50, 350)
	scene.fog = fog

	if (gui) {
		const gf = gui.addFolder('Fog')
		gf.add(scene.fog, 'near').min(1).max(2000).step(0.1).name('Fog near')
		gf.add(scene.fog, 'far').min(1).max(2000).step(0.1).name('Fog far')
	}
}
