import {
	WebGLRenderer,
	PCFSoftShadowMap,
	sRGBEncoding,
	NoToneMapping,
	LinearToneMapping,
	ReinhardToneMapping,
	CineonToneMapping,
	ACESFilmicToneMapping,
} from 'three'
import { isHighPerfDevice, isIOS } from './utils'

export class Randy {
	constructor(canvas, sizes, updateAllMeterials, gui) {
		this.renderer = new WebGLRenderer({
			canvas,
			powerPreference: 'high-performance',
			antialias: true,
		})
		this.renderer.shadowMap.enabled = isHighPerfDevice
		this.renderer.shadowMap.type = PCFSoftShadowMap
		this.renderer.setSize(sizes.width, sizes.height)
		this.renderer.physicallyCorrectLights = true
		this.renderer.outputEncoding = sRGBEncoding
		this.renderer.toneMapping = ACESFilmicToneMapping
		this.renderer.setClearColor(0xffeebb)
		this.renderer.setPixelRatio(
			isIOS ? Math.min(window.devicePixelRatio, 2) : 1
		)

		if (gui) {
			const gf = gui.addFolder('Renderer')
			gf.add(this.renderer.shadowMap, 'enabled')
				.onChange(updateAllMeterials)
				.name('Renderer shadowMap enabled')
			gf.add(this.renderer, 'toneMapping', {
				No: NoToneMapping,
				Linear: LinearToneMapping,
				Reinhard: ReinhardToneMapping,
				Cineon: CineonToneMapping,
				ACESFilmic: ACESFilmicToneMapping,
			})
				.name('Renderer tone mapping')
				.onFinishChange(() => {
					this.renderer.toneMapping = Number(this.renderer.toneMapping)
					updateAllMeterials()
				})
			gf.add(this.renderer, 'toneMappingExposure')
				.min(0)
				.max(10)
				.step(0.001)
				.name('Renderer tone mapping exposure')
		}
	}
}
