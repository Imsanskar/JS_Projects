var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;


var canvas = document.querySelector('canvas')
var context = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;


context.fillStyle = 'red';
context.fillRect(0,0, CANVAS_WIDTH, CANVAS_WIDTH);


function ArrayMember(x,y, height, width, color="gray"){
	this.x = x;
	this.y = y;
	this.height = height;
	this.width = width;
	this.color = color;
	this.draw = ()=>{
		console.log(this.height)
		context.fillStyle = this.color;
		context.fillRect(this.x,this.y, this.width, -5 * this.height);
	}

	this.isSorted = () => this.color = "green";

}



function draw(array){
	context.save();
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = 'white';
	context.beginPath();
	context.moveTo(0, canvas.height-100);
	context.lineTo(canvas.width, canvas.height-100);
	context.stroke();
	context.restore();
	for(let  i = 0; i < 100; i++){
		array[i].draw();
	}
}

const shuffledArrayInRange = (bottom = 1, top = 30) => {
  const arr = [];
  for (let i = bottom; i < top; i++) arr.push(i);
  return arr.sort((a, b) => (Math.random() > 0.5 ? 1 : -1));
};


let array = []
let a = shuffledArrayInRange(1,101);
for(let i = 0; i < 100; i++){
	array.push(new ArrayMember(12 * i, canvas.height-100,a[i], 10, "gray"));
}

console.log(array);
let delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function bubble_Sort(arr){
    let size = arr.length;
    for(let i = 0; i < size; i++){
        for(let j = 0; j < size - 1; j++){
            draw(array);
            await delay(1); // <----
            if (arr[j].height > arr[j+1].height){
                let temp = arr[j].height;
                arr[j].height = arr[j+1].height;
                arr[j+1].height = temp;
            }
        }
		arr[size-i-1].isSorted();
    }
    return arr;
}

bubble_Sort(array).then(sorted=>console.log(...sorted));
