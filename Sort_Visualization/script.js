var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;


var canvas = document.querySelector('canvas')
var context = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;


context.fillStyle = 'red';
context.fillRect(0,0, CANVAS_WIDTH, CANVAS_WIDTH);



function draw(array){
	context.save();
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = 'white';
	context.beginPath();
	context.moveTo(0, canvas.height-100);
	context.lineTo(canvas.width, canvas.height-100);
	context.stroke();
	context.restore();
	context.fillStyle = 'white';
	for(let i = 0; i < array.length; i++){
		context.fillRect(0 + 10*i,canvas.height-100,9,-5 * array[i]);
	}
}




let array = []

for(let i = 0; i < 100; i++){
	array.push(100-i);
}


let delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function bubble_Sort(arr){
    let size = arr.length;
    for(let i = 0; i < size; i++){
        for(let j = 0; j < size - 1; j++){
            draw(array);
            await delay(1); // <----
            if (arr[j] > arr[j+1]){
                let temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
    return arr;
}

bubble_Sort(array).then(sorted=>console.log(...sorted));
