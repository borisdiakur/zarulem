import { Body } from 'cannon-es'
import {
	FrontSide,
	Scene,
	MeshStandardMaterial,
	Mesh,
	NearestFilter,
	PlaneBufferGeometry,
	ShaderMaterial,
	LoadingManager,
} from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Sounds } from './sounds'
import { initLights } from './lights'
import { Head } from './head'
import { Randy } from './renderer'
import { PostProcessing } from './postProcessing'
import { initFog } from './fog'
import { initTick } from './tick'
import { initControls } from './controls'
import { Ignition } from './ignition'
import { Speed } from './speed'
import { Triggers } from './triggers'
import { Steering } from './steering'
import { Turntable } from './turntable'
import { Car } from './car'
import { addBoxToBody, addCylinderToBody } from './utils'
import { Physics } from './physics'
import { Magnet } from './magnet'
import { Joystick } from './joystick'
import { Keys } from './keys'

void (async () => {
	const isDebug = location.hash === '#debug'

	const canvas = document.createElement('canvas')
	canvas.classList.add('webgl')
	document.body.appendChild(canvas)

	// Stats
	let stats
	if (isDebug) {
		const Stats = (await import('stats.js')).default
		stats = new Stats()
		stats.showPanel(0)
		document.body.appendChild(stats.dom)
	}

	// Debug
	let gui
	if (isDebug) {
		const { GUI } = await import('dat.gui')
		gui = new GUI({
			width: 346,
		})
		gui.closed = true
	}

	// Interactions blocker
	const interactions = {
		blocked: true,
	}

	// Scene
	const scene = new Scene()

	// Overlay
	const overlayGeometry = new PlaneBufferGeometry(2, 2, 1)
	const overlayMaterial = new ShaderMaterial({
		transparent: true,
		uniforms: {
			uAlpha: { value: 1 },
		},
		vertexShader: `
			void main() {
				gl_Position = vec4(position, 1.0);
			}
    `,
		fragmentShader: `
			uniform float uAlpha;
			void main() {
				gl_FragColor = vec4(0.12, 0.12, 0.08, uAlpha);
			}
    `,
	})
	let overlay = new Mesh(overlayGeometry, overlayMaterial)
	scene.add(overlay)

	// Key hints
	const keys = new Keys()

	// Sizes
	const bcr = document.body.getBoundingClientRect()
	const sizes = {
		width: bcr.width,
		height: bcr.height,
	}
	function handleResize() {
		// Update sizes
		const bcr = document.body.getBoundingClientRect()
		sizes.width = bcr.width
		sizes.height = bcr.height

		// Update camera
		head.onResize(sizes)

		// Update renderer
		randy.renderer.setSize(sizes.width, sizes.height)

		// Update effect composer
		postProcessing.effectComposer.setSize(sizes.width, sizes.height)
	}
	window.addEventListener('resize', handleResize)

	function updateAllMeterials() {
		scene.traverse((child) => {
			if (
				child instanceof Mesh &&
				child.material instanceof MeshStandardMaterial
			) {
				child.material.needsUpdate = true
				child.castShadow = true
				child.receiveShadow = true
			}
		})
	}

	// Sounds
	const sounds = new Sounds(interactions, gui)

	// Physics
	const physics = new Physics(gui, scene)
	const world = physics.world

	// Fog
	initFog(scene, gui)

	// Lights
	initLights(scene, gui)

	// Camera
	const head = new Head(scene, sizes, gui)

	// Joystick
	const joystick = new Joystick(interactions)

	// Controls
	const controls = initControls(canvas, head.camera, gui)

	// Renderer
	const randy = new Randy(canvas, sizes, updateAllMeterials, gui)

	// Post processing
	const postProcessing = new PostProcessing(
		scene,
		head.camera,
		randy.renderer,
		sizes,
		gui
	)

	function enter() {
		document.getElementById('overlay').classList.add('removed')
		head.enter()
		gsap.to(overlayMaterial.uniforms.uAlpha, {
			duration: 1,
			value: 0,
			onComplete: () => {
				document.body.removeChild(document.getElementById('overlay'))
				scene.remove(overlay)
				overlay = null
				interactions.blocked = false
				joystick.enter()
				keys.enter()
				keys.hintUp()
			},
		})
	}

	const progress = document.getElementById('progress')
	let progressXHR = 0
	let progressFiles = 0
	let progressAll = 0
	const loadingManager = new LoadingManager(
		() => {
			gsap.delayedCall(0.5, () => {
				enter()
			})
		},
		(itemUrl, itemsLoaded, itemsTotal) => {
			const progressFiles = itemsLoaded / itemsTotal
			progressAll = Math.max(progressAll, progressXHR, progressFiles)
			progress.style.transform = `translateX(${(-1 + progressAll) * 100}%)`
		}
	)

	const gltfLoader = new GLTFLoader(loadingManager)

	const turntableBody = new Body({
		mass: 0,
		material: physics.defaultMaterial,
	})
	world.addBody(turntableBody)

	const plateBody = new Body({
		mass: 0,
		material: physics.defaultMaterial,
	})
	world.addBody(plateBody)

	gltfLoader.load(
		'zarulem.glb',
		async (gltf) => {
			const turntableItems = []
			let car, carMesh, carBody, steering, speed, magnet, gearwheel, ignition

			gltf.scene.traverse((child) => {
				// Improve performance of textures.
				if (
					child instanceof Mesh &&
					child.material instanceof MeshStandardMaterial
				) {
					child.material.side = FrontSide
					if (
						child.name === 'rug' ||
						(child.name.indexOf('plate') === 0 && child.material.map)
					) {
						child.material.map.generateMipmaps = false
						child.material.map.minFilter = NearestFilter
					}
				}

				if (child.name === 'key') {
					ignition = new Ignition(child, sounds, interactions, keys)
				}
				if (child.name === 'speed') {
					speed = new Speed(child, joystick, head, sounds, interactions, keys)
				}
				if (child.name === 'steering') {
					steering = new Steering(
						canvas,
						child,
						head,
						joystick,
						controls,
						sounds,
						interactions,
						gui
					)
					head.connectToWheel(child)
				}
				if (child.name === 'shapePlate') {
					addCylinderToBody(plateBody, child)
				}
				if (['obstacles', 'bridges', 'plate'].includes(child.name)) {
					turntableItems.push(child)
				}

				if (child.name === 'gearwheel') {
					gearwheel = child
				}

				if (child instanceof Mesh && child.name.indexOf('shape') === 0) {
					child.visible = false
				}

				if (child instanceof Mesh && child.name.indexOf('shapeWall') === 0) {
					addBoxToBody(turntableBody, child)
				}
				if (child.name.indexOf('shapeCylinder') === 0) {
					addCylinderToBody(turntableBody, child)
				}

				if (child.name === 'car') {
					carMesh = child
				}
				if (child.name.indexOf('shapeCar') === 0) {
					car = new Car(
						child,
						physics.defaultMaterial,
						world,
						sounds,
						interactions,
						joystick,
						keys,
						gui
					)
					carBody = car.body
					world.addBody(carBody)

					magnet = new Magnet(car, world, gui)
				}
			})

			const turntable = new Turntable(
				scene,
				turntableItems,
				turntableBody,
				gearwheel,
				gui
			)
			// @ts-ignore
			speed.setTurntable(turntable)
			// @ts-ignore
			speed.setCar(car)
			// @ts-ignore
			speed.setIgnition(ignition)
			// @ts-ignore
			ignition.setSpeed(speed)
			// @ts-ignore
			ignition.setCar(car)

			// @ts-ignore
			steering.setMagnet(magnet)

			// @ts-ignore
			steering.setSpeed(speed)

			// @ts-ignore
			car.setTurntable(turntable)

			// @ts-ignore
			car.setIgnition(ignition)

			const objectsToUpdate = [
				{
					mesh: carMesh,
					body: carBody,
				},
				{
					mesh: turntable.groupTurntable,
					body: turntableBody,
				},
			]

			new Triggers(world, car, gui)

			scene.add(gltf.scene)

			updateAllMeterials()

			// Animate
			initTick(
				postProcessing,
				randy,
				controls,
				steering,
				turntable,
				car,
				world,
				objectsToUpdate,
				stats
			)
		},
		(xhr) => {
			progressXHR = xhr.loaded / 8433840
			progressAll = Math.max(progressAll, progressXHR, progressFiles)
			progress.style.transform = `translateX(${(-1 + progressAll) * 100}%)`
		}
	)
})()
