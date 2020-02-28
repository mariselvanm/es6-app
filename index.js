import DynamicScroller from "./dynamic-scroller";

let NUMBER_OF_ELE = 500;
let MIN_HEIGHT = 100;
let MAX_HEIGHT = 300;
let $ROOT_ELE = document.getElementById("app");
let elements = [];

for (let index = 0; index < NUMBER_OF_ELE; index++) {
  let randomHeight =
    Math.floor(Math.random() * (MAX_HEIGHT - MIN_HEIGHT)) + MIN_HEIGHT;
  elements.push(randomHeight);
}

function insertElements(startIndex, endIndex) {
  let createdElements = [];

  for (let index = startIndex; index <= endIndex; index++) {
    if ( index > NUMBER_OF_ELE - 1 ) break;
    let ele = document.createElement("div");
    ele.className = index%2 ? 'item item-blue': 'item item-red';
    ele.innerHTML = `ITEM : ${index}`;
    ele.style.height = `${elements[index]}px`;
    createdElements.push(ele);
  }

  let items = $ROOT_ELE.querySelectorAll(".item");

  items.forEach(item => {
    item.remove();
  });

  createdElements.forEach(ele => {
    $ROOT_ELE.append(ele);
  });
}

insertElements(0, 5);

const scroller = new DynamicScroller($ROOT_ELE, ".item", {
  displayElements: 5,
  hiddenElements: 3,
  totalElements: NUMBER_OF_ELE,
  averageHeight: 300,
  scrollTarget: window,
  callback: insertElements
});
