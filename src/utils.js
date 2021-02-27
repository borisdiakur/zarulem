import { Vector3 } from 'three'
import { Box, Cylinder, Vec3 } from 'cannon-es'

export function addBoxToBody(body, mesh) {
	const width = mesh.geometry.boundingBox.min.x * 2
	const height = mesh.geometry.boundingBox.getSize(new Vector3()).y * 1
	const depth = mesh.geometry.boundingBox.min.z * 2
	const shape = new Box(new Vec3(width / 2, height / 2, depth / 2))
	body.addShape(shape, mesh.position, mesh.quaternion)
}

export function addCylinderToBody(body, mesh) {
	const radius = mesh.geometry.boundingBox.min.x / -1
	const height = mesh.geometry.boundingBox.getSize(new Vector3()).y * 1
	const shape = new Cylinder(radius, radius, height, 16)
	body.addShape(shape, mesh.position, mesh.quaternion)
}

export function normalize(val, max, min) {
	return (val - min) / (max - min)
}

export const isTouchDevice =
	'ontouchstart' in window ||
	navigator.maxTouchPoints > 0 ||
	navigator.msMaxTouchPoints > 0

export const isIOS =
	[
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod',
	].includes(navigator.platform) ||
	// iPad on iOS 13 detection
	(navigator.userAgent.includes('Mac') && 'ontouchend' in document)

export const isHighPerfDevice =
	!isTouchDevice || isIOS || window.navigator.hardwareConcurrency > 4

export function inIframe() {
	try {
		return window.self !== window.top
	} catch (e) {
		return true
	}
}
