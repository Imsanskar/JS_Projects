const canvasHeight = window.innerHeight;
const canvasWidth = window.innerWidth;

var canvas = document.querySelector('canvas')
var context = canvas.getContext('2d')

canvas.height = canvasHeight
canvas.width = canvasWidth

var zoomsize = 10

//Complex number utility functions
class Complex{
	constructor(real, imag){
		this.real = real
		this.imag = imag
	}	
}

Complex.prototype.add = function(other){
	return new Complex(
		this.real + other.real,
		this.imag + other.imag
	)
}


Complex.prototype.multiply = function(other){
	return new Complex(
		this.real * other.real - other.imag * this.imag,
		this.imag * other.real + other.imag * this.real
	)
}

Complex.prototype.absolute = function(){
	return Math.sqrt(Math.pow(this.real, 2) + Math.pow(this.imag, 2))
}

/*
	Check if the complex number diverges or not
*/
const doesDiverge = function(c, maxIter, radius){
	z = new Complex(0, 0);
	n = 0
	while(z.absolute() < radius && n < maxIter){
		z = z.multiply(z).add(c)
		n += 1
	}
	return [n, z]
}

async function drawMandelBrotSet(realStart, realEnd, imagStart, imagEnd){
	const maxIteration = 100
	const radius = 4
	for(let x = realStart; x <= realEnd; x += (realEnd - realStart) / canvasWidth){
		for(let y = imagStart; y <= imagEnd; y += (imagEnd - imagStart) / canvasHeight){
			//get the complex number
			const c = new Complex(x, y)

			//check if the number diverges or not
			const [niter, maxZ] = doesDiverge(c, maxIteration, radius)

			//get the color according to divergence of complex number
			const color = ((niter - Math.log2(maxZ.absolute() / radius)) / maxIteration) * 255;
			
			// get individual color
			const r = Math.min(255, 5 * color);
			const g = Math.min(255, 3 * color);
			const b = Math.min(255, 2 * color);

			// Cast the coordinates on the complex plane back to actual pixel coordinates
			const screenX = (x - realStart) / (realEnd - realStart) * canvasWidth
			const screenY = (y - imagStart) / (imagEnd - imagStart) * canvasHeight
			
			// Draw a single pixel
			context.fillStyle = `rgb(${r}, ${g}, ${b})`
			context.fillRect(screenX, screenY, 1, 1)
		}
	}
}

const realInitial = {
	start: -2.5,
	end: 1
}

const imagInitial = {
	start: -2,
	end: 2
}

let real = realInitial
let imag = imagInitial

drawMandelBrotSet(real.start, real.end, imag.start, imag.end).then(completed => console.log("Completed"))


/*
	For the zoom
*/
document.addEventListener('dblclick', event => {
	const selectedWidth = canvasWidth / zoomsize;
	const selectedHeight = canvasHeight / zoomsize;

	const initialX = (event.clientX - (selectedWidth / 2)) / canvasWidth;
	const finalX = (event.clientX + (selectedWidth / 2)) / canvasWidth;
	const initialY = (event.clientY - (selectedHeight / 2)) / canvasHeight;
	const finalY = (event.clientY + (selectedHeight / 2)) / canvasHeight;

	real = {
		start: ((real.end - real.start) * initialX) + real.start,
		end: ((real.end - real.start) * finalX) + real.start,
	}
	
	imag = {
		start: ((imag.end - imag.start) * initialY) + imag.start,
		end: ((imag.end - imag.start) * finalY) + imag.start,
	}

	drawMandelBrotSet(real.start, real.end, imag.start, imag.end).then(completed => console.log("Completed"))
})


/**
 * Makes the selector follow the mouse
 */
 document.addEventListener('mousemove', event => {
	const selector = document.querySelector('.selector')
	selector.style.top = `${event.clientY}px`
	selector.style.left = `${event.clientX}px`
	selector.style.width = `${window.innerWidth / 10}px`
	selector.style.height = `${window.innerHeight / 10}px`
})

//to return to initial state
document.querySelector('#reset').addEventListener('click', () => {
	real = realInitial
	imag = imagInitial
	drawMandelBrotSet(real.start, real.end, imag.start, imag.end).then(completed => console.log("Completed"))
})
