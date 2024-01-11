
const array=[];

let isPaused=false;
let pauseTimeout;
let isPlaying=false;
let isSound=true;
var barSlider = document.getElementById("numBars");
var output = document.getElementById("printNumBars");
output.innerHTML = barSlider.value; // Display the default barSlider value
let n=barSlider.value;

var speedSlider = document.getElementById("speedSlider");

const fileName = window.location.pathname.split("/").pop();


let s=speedSlider.value;


init();
let audioCtx=null;

function init() {
    
   
    isPlaying=false;
    isPaused=true; 
    
    for (let i = 0; i < n; i++) {
        array[i] = Math.random(0.1, 1);
    }
    showBars();
   
}

barSlider.oninput = function() {
    n = this.value;
    if (!isPlaying && isPaused) {
        updateBars();
    }
  }

  function updateBars() { 
    array.length = 0; // Clear the array
    for (let i = 0; i < n; i++) {
        array[i] = Math.random(0.1, 1);
    }
    showBars();
}

function toggleSound() {
    const soundBtn = document.querySelector('.sortingPage .soundBtn');
    const soundIcon = soundBtn.querySelector('img');
    isSound=!isSound;
    if (isSound) {
        soundIcon.src = 'sound_on_icon.png';
    }
    else {
        soundIcon.src = 'sound_off_icon.png';
    }

}

function play() {
    isPaused=false;
    if (isPlaying) { // makes sure nothing happens if you click play while alr playing 
        return;
    }
    isPlaying=true; 
    const copy=[...array]; 

    console.log(fileName);
    if (fileName=="bubble.html") {
        var moves=bubbleSort(copy);
    }
    else if (fileName=="selection.html") {
        var moves=selectionSort(copy);
    }
    else if (fileName=="merge.html") {
        var moves=selectionSort(copy); // temporary, untill merge is fixed 
    }

    animate(moves); // animate(indices of bars that were swapped)
}
function pause(){
    isPaused=true;
    isPlaying=false;
    clearTimeout(pauseTimeout); 
}

function playNote(freq, pIsSound){
    if (!isSound) {
        return; 
    }
    if(audioCtx==null) {
        audioCtx=new(AudioContext ||
        window.webkitAudioContent
        )();
    }
    const dur=0.1;
    const osc=audioCtx.createOscillator();
    osc.frequency.value=freq;
    osc.start();
    osc.stop(audioCtx.currentTime+dur);
    const node=audioCtx.createGain();
    node.gain.value=0.1;
    node.gain.linearRampToValueAtTime(
        0, audioCtx.currentTime+dur
    );
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function animate(moves){
    s=speedSlider.value;
    if (isPaused) {
        return;
    }

    if(moves.length==0) {
        // animation is complete
        return;
    }
    const cur_move=moves.shift(); // const cur_move is type move
    const [i,j]=cur_move.swapped_indices

    if(cur_move.move_type=="swap") {
        [array[i], array[j]]= [array[j], array[i]];
    }
    if (cur_move.move_type=="push") {
        // do something

    }

    playNote(200+array[i]*500, isSound);
    playNote(200+array[j]*500, isSound);

    showBars(cur_move);
    pauseTimeout= setTimeout(function() {
        animate(moves);
    }, 1000-s); 
   
    }


function selectionSort(array) {
    const moves = [];  // array with obect type with swapped indices (arr) and move_type (swap)
    do {
        var swapped = false;
        for (let i = 0; i < array.length; i++) {
            // for each element, set this to the current min
            let cur_min_index=i;

            // then we stat at i+1 and compare cur min and the next element 
            for (let j=i+1; j< array.length; j++) {
                moves.push({swapped_indices:[cur_min_index , j], move_type:"comparison"}); //highlight these being compared 
                if (array[j] < array[cur_min_index]) {
                    cur_min_index = j;
                }
            }
        moves.push({swapped_indices:[i, cur_min_index], move_type:"swap"}); //highlight this
        [array[i], array[cur_min_index]] = [array[cur_min_index], array[i]];

            
        }
    } while (swapped);
    console.log(array);
    return moves; 
}

function bubbleSort(array) {
    const moves = [];  // array with obect type with swapped indices (arr) and move_type (swap)
    do {
        var swapped = false;
        for (let i = 1; i < array.length; i++) {
            moves.push({swapped_indices:[i - 1, i], move_type:"comparison"});
            if (array[i - 1] > array[i]) {
                swapped = true;
                moves.push({swapped_indices:[i - 1, i], move_type:"swap"});
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
            }
            
        }
    } while (swapped);
    return moves; 
}

function mergeSort(array) {
    const moves = [];  // array with object type with swapped indices (arr) and move_type (swap)
    
    // Function to merge two sorted arrays
    function merge(left, right, leftIndex, rightIndex) {
        let result = [];
        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {
            moves.push({
                swapped_indices: [leftIndex + i, rightIndex + j],
                move_type: "comparison"
            });

            if (left[i] <= right[j]) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        while (i < left.length) {
            moves.push({
                swapped_indices: [leftIndex + i, rightIndex + j - 1],
                move_type: "comparison"
            });
            result.push(left[i]);
            i++;
        }

        while (j < right.length) {
            moves.push({
                compare_elements: [leftIndex + i - 1, rightIndex + j],
                move_type: "comparison"
            });
            result.push(right[j]);
            j++;
        }

        // Reset the array to include the merged elements
        for (let k = 0; k < result.length; k++) {
            array[leftIndex + k] = result[k];
        }

        return result;
    }

    // Main merge sort function
    function mergeSortRec(array, leftIndex = 0) {
        if (array.length <= 1) {
            return array;
        }

        const mid = Math.floor(array.length / 2);
        const left = array.slice(0, mid);
        const right = array.slice(mid);

        const leftResult = mergeSortRec(left, leftIndex);
        const rightResult = mergeSortRec(right, leftIndex + mid);

        const mergedArray = merge(leftResult, rightResult, leftIndex, leftIndex + mid);

        return mergedArray;
    }

    mergeSortRec(array);
    return moves;
}


function showBars(cur_move) {
    const container = document.querySelector('.sortingPage .container');
    container.innerHTML="";
    for(let i=0; i<array.length; i++) {
       const bar=document.createElement("div");

        bar.style.height=array[i]*180+"%";
        bar.classList.add("bar");

        if(cur_move && cur_move.swapped_indices.includes(i)) {
            bar.style.backgroundColor=cur_move.move_type=="swap"?"red":"blue";
        }
        


    container.appendChild(bar);
}

}


