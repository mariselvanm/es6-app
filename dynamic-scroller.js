/**
 * 1. Initialize the plugin with
 *    root element and children selectors or DOM reference.
 * 2. config options :
 *      number of elements to display
 *      total number of elements
 *      average height
 *      callback for rerender
 **/

// Forward scroll:
// set parent container height = cumulative height of displayed elemts + (avg height * remanining number of elemnts)
// onScorll if more than (no fo displayed elem )no fo displayed elem/3) elements goes out of the viewport,
// add hidden ele height into dummy div ele.
// fire rerender event with start & end index.

// Backward scroll;
// onScorll if less than (no fo displayed elem )no fo displayed elem/3) elements present outside the viewport
// fire rerender event with start & end index.
// reduce dummy div height by inserted ele height.

// Implemetation purpose or TODOS
// 1. get values and set as class properties while initialize the plugin
// 2. After initializing attach the scroll evenet to the root element
// 3. set current height of dummy div into the class property

// TODO : Need option for update total number of ele. Bez, sometime we
//        don't know how many elemetns are present or available.

export default class DynamicScroller {
  constructor(rootEle, childrenSelector, config) {
    this.childrenHeight = [];
    if (typeof rootEle === "string") {
      this.rootEle = document.querySelector(rootEle);
    } else {
      this.rootEle = rootEle || document.body;
    }

    if (childrenSelector) {
      this.childrenSelector = childrenSelector;
    } else {
      throw new Error(
        "Dynamic scroller needs a valid children selector to function properly."
      );
    }

    const {
      displayElements = 5,
      totalElements = 0,
      averageHeight = 100,
      hiddenElements = 0,
      scrollTarget = this.rootEle,
      callback = () => {}
    } = config;
    this.displayElements = displayElements;
    this.totalElements = totalElements;
    this.averageHeight = averageHeight;
    this.hiddenElements = hiddenElements || Math.floor(scrollTarget.offsetHeight / averageHeight);
    this.callback = callback;
    this.dynamicDivHeight = 0;
    // Store the initial start and end index position
    this.startIndex = 0;
    this.endIndex = displayElements;

    // Attach scollHandler with rootEle
    scrollTarget.addEventListener("scroll", this.scrollHandler.bind(this));

    // Create and append dynamic div for rootEle
    let divEle = document.createElement('div');
    divEle.className = "dynamic-div";
    rootEle.prepend(divEle);
    this.offsetDiv = divEle;
  }

  // TODO:
  // 1. get all children element from dom.
  // 2. loop through the array find which fall out of
  //    our viewport top.
  // 3. At any point of time when the scroll event is fired
  //    find how many elements out of our viewport+displayEle/3
  // 4. get the count and add it into the start postion state
  // 5. calculate the end position based on our start position and call the callback function.
  // 6. create dummy div add the height of removed elements.
  scrollHandler() {
    // TODO: Array.from polyfill need to be added.
    const childrenElements = Array.from(this.rootEle.querySelectorAll(".item"));
    const oldStartIndex = this.startIndex;
    const oldEndIndex = this.endIndex;
    const hiddenElements = this.hiddenElements;

    const eleOutOfTop = childrenElements.filter(ele => {
      return isEleOutOfViewPortTop(ele, this.scrollTarget);
    });
    // Get the elements below the viewport
    const eleOutOfBottom = childrenElements.filter(ele => {
      return isEleOutOfViewPortBottom(ele, this.scrollTarget);
    });

    // Find out Start index
    if (eleOutOfTop.length > hiddenElements) {
        const elementToBeRemoved = eleOutOfTop.length - hiddenElements;
        this.startIndex += elementToBeRemoved;
    } else if (eleOutOfTop.length < hiddenElements) {
        const elementToBeAdded = hiddenElements - eleOutOfTop.length;
        this.startIndex = Math.max(this.startIndex - elementToBeAdded, 0);
    }

    // Find out End Index
    if (eleOutOfBottom.length > hiddenElements) {
        const elementToBeRemoved = eleOutOfBottom.length - hiddenElements;
        this.endIndex -= elementToBeRemoved;
    } else if (eleOutOfBottom.length < hiddenElements) {
        const elementToBeAdded = hiddenElements - eleOutOfBottom.length;
        this.endIndex += elementToBeAdded;
    }

    if (this.startIndex !== oldStartIndex || this.endIndex !== oldEndIndex) {
      // Manipulate childrenHeight array based on previousStartIndex and the current
      // startIndex value.
      if (oldStartIndex < this.startIndex) {
        //let childrenHeight = [];
        for (let index = 0; index < (eleOutOfTop.length - hiddenElements); index++) {
          const styleObj = getComputedStyle(eleOutOfTop[index]);
          const totalOffsetHeight = eleOutOfTop[index].offsetHeight + parseInt(styleObj.marginTop) + parseInt(styleObj.marginBottom);
          this.dynamicDivHeight += totalOffsetHeight;
          //childrenHeight.push(totalOffsetHeight);
        }
        // this.childrenHeight = [ ...this.childrenHeight, ...childrenHeight];
      }
  
      this.callback(this.startIndex, this.endIndex);

      if(oldStartIndex > this.startIndex) {
        let addedToTop = oldStartIndex - this.startIndex;
        let differenceHeight = 0;
        const childrenElements = Array.from(this.rootEle.querySelectorAll(".item"));
        for(let index = 0; index < addedToTop; index++) {
          const styleObj = getComputedStyle(childrenElements[index]);
          const totalOffsetHeight = childrenElements[index].offsetHeight + parseInt(styleObj.marginTop) + parseInt(styleObj.marginBottom);
          differenceHeight += totalOffsetHeight;
        }
        this.dynamicDivHeight -= differenceHeight;
      }
  
      // const offsetDivHeight = this.childrenHeight.reduce((acc, val) => acc + val, 0);
      this.offsetDiv.style.height = `${this.dynamicDivHeight}px`;
    }
  }

  // Refresh the start and end index after we add or remove the element in the viewport
  refreshIndex() {
    this.scrollHandler();
  }
}

function isEleOutOfViewPortTop(element, parentEle) {
  const elementBottom = element.getBoundingClientRect().bottom;
  const parentEleTop = parentEle ? parentEle.getBoundingClientRect().top : 0;
  return elementBottom < parentEleTop;
}

function isEleOutOfViewPortBottom(element, parentEle) {
  const elementTop = element.getBoundingClientRect().top;
  const parentEleBottom = parentEle ? parentEle.getBoundingClientRect().bottom : window.innerHeight;
  return elementTop > parentEleBottom;
}


// set initial height as 0
// once element removed from dom add the height into initial height
// once the element in viewport remove the height