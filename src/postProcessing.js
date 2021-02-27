import {
	LinearFilter,
	RGBAFormat,
	sRGBEncoding,
	Vector2,
	WebGLMultisampleRenderTarget,
	WebGLRenderTarget,
} from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { isIOS, isHighPerfDevice } from './utils'

export class PostProcessing {
	constructor(scene, camera, renderer, sizes, gui) {
		// Post processing
		const RenderTarget = renderer.capabilities.isWebGL2
			? WebGLMultisampleRenderTarget
			: WebGLRenderTarget
		const renderTarget = new RenderTarget(sizes.width, sizes.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			encoding: sRGBEncoding,
		})

		this.effectComposer = new EffectComposer(renderer, renderTarget)
		this.effectComposer.setPixelRatio(
			isIOS ? Math.min(window.devicePixelRatio, 2) : 1
		)

		const renderPass = new RenderPass(scene, camera)
		this.effectComposer.addPass(renderPass)

		this.unrealBloomPass = new UnrealBloomPass(
			new Vector2(sizes.width, sizes.height),
			0.4,
			1.5,
			0.5
		)
		this.unrealBloomPass.enabled = isHighPerfDevice
		this.effectComposer.addPass(this.unrealBloomPass)

		if (gui) {
			const gf = gui.addFolder('Post processing')
			gf.add(this.unrealBloomPass, 'enabled').name('Unreal bloom pass enabled')
			gf.add(this.unrealBloomPass, 'strength')
				.min(0)
				.max(2)
				.step(0.001)
				.name('Unreal bloom pass strength')
			gf.add(this.unrealBloomPass, 'radius')
				.min(0)
				.max(2)
				.step(0.001)
				.name('Unreal bloom pass radius')
			gf.add(this.unrealBloomPass, 'threshold')
				.min(0)
				.max(1)
				.step(0.001)
				.name('Unreal bloom pass threshold')
		}
	}
}
