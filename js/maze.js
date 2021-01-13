"use strict";

const NORMAL_CLASS = "is-primary"; // CSS class for normal inputs.
const WARNING_CLASS = "is-danger"; // CSS class for input warnings.

const MIN_WIDTH = 3;
const MIN_HEIGHT = 3;
const MAX_WIDTH = 8;
const MAX_HEIGHT = 16;
const DEFAULT_WIDTH = 6;
const DEFAULT_HEIGHT = 10;

const DEFAULT_PATH = "0";
const DEFAULT_WALL = "1";
const DEFAULT_END = "2";
const DEFAULT_START = "3";

const DEFAULT_CHEQUER = "#dedede";
const RED = "#ed6c63";
const GREEN = "#97cd76";
const BROWN = "#f68b39";

const R_PREFIX = "rowNo"; // Prefix for rows in generation.
const C_PREFIX = "rowCol";

function FormElements(empty, wall, end, start, w, h) {
	/* Set string values to set the maze array. */

	this.empty = String(empty);
	this.wall = String(wall);
	this.end = String(end);
	this.start = String(start);

	/* Array properties. Must eventually check isInt. */
	this.width = w;
	this.height = h;
}

FormElements.prototype.genArray = function() {
	/* Main logic after GUI fiddling is complete to fill the div with
	 * a pretty-printed array. */

	var table = document.getElementById("mainMaze");
	var divOut = document.getElementById("codeDisplay");
	var node, textNode;
	var strOut = 'var arr = [ \n';

	for (var i = 0, row; row = table.rows[i]; i++) {
		strOut += '    [ ';

	    for (var j = 0, col; col = row.cells[j]; j++) {
	    	strOut += '"' + col.getAttribute("val") + '", ';
	    }
	    strOut = strOut.slice(0, -3); // Remove last s,
	    strOut += '"],\n';
	}

	strOut = strOut.slice(0, -2);
	strOut += '\n]\n\n';

	/* Create new code node. */
	node = document.createElement("pre");

	textNode = document.createTextNode(strOut);
	node.appendChild(textNode);
	node.setAttribute("class", "prettyprint linenums lang-swift")

	/* Delete any existing, and add to child. */
	killAllChildren("codeDisplay");
	divOut.appendChild(node);

	/* Finally, re-run pretty print synchronously. */
	PR.prettyPrint();

}

FormElements.prototype.morphMap = function() {
	/* Change the size of/create the displayed map. */

	var node, textNode;
	var i = 0;
	var j;

	/* First we need to check if there are any/changed values in the array
	 * string values. */
	var pathIn = document.getElementById("pathInput");
	var wallIn = document.getElementById("wallInput");
	var endIn = document.getElementById("endInput");
	var startIn = document.getElementById("startInput");

	var allChanged = pathIn.value && wallIn.value && 
					 endIn.value && startIn.value;
	var oneChanged = pathIn.value || wallIn.value || 
					 endIn.value || startIn.value;

	/* Before that logic, we  destroy the table.. */
	killAllChildren("mainMaze");

	if (allChanged) {
		/* Hacky code == "I want to sleep." */
		if ((pathIn.value != wallIn.value) &&
			(pathIn.value != endIn.value) &&
			(pathIn.value != startIn.value) &&
			(wallIn.value != endIn.value) &&
			(wallIn.value != startIn.value) &&
			(endIn.value != startIn.value)) {
		this.empty = pathIn.value;
		this.wall = wallIn.value;
		this.end = endIn.value;
		this.start = startIn.value;
		} else {
			alert("No duplicates allowed.");
			return;
		}
	} else if (!allChanged) {
		if (oneChanged) {
			alert("If you set one of the values you must set them all.");
			return;
		}
	}

	/* Then we set the height and width as we need. */
	var h = document.getElementById("heightSelect");
	var hs = h.options[h.selectedIndex].value;
	var w = document.getElementById("widthSelect");
	var ws = w.options[w.selectedIndex].value;

	this.height = parseInt(hs);
	this.width = parseInt(ws);

	/* Use nested iteration to create the table. */
	while (i < this.height) {
		/* Note: as long as HTML arranges tables in order when they are
		 * created, this method will work. */
		node = document.createElement("tr");
		node.setAttribute("id", R_PREFIX + String(i));

		document.getElementById("mainMaze").appendChild(node);

		j = 0;

		while (j < this.width) {
			node = document.createElement("td");

			node.setAttribute("id", C_PREFIX + String(j) + String(i));
			node.setAttribute("x", String(j));
			node.setAttribute("y", String(i));
			node.setAttribute("val", this.empty);
			node.setAttribute("onClick", "elem.flipBit(" + String(j) + 
							  ", " + String(i) + ")");

			/* Shade chequerbox. */
			if ((i+j)%2 == 0) {
				node.style.background = DEFAULT_CHEQUER;
			}

			document.getElementById(R_PREFIX + String(i)).appendChild(node);

			j++;
		}

		i++;
	}

}

FormElements.prototype.flipBit = function(x, y) {
	/* Changes a cell by cycling the different types of block. */

	var cell = document.getElementById(C_PREFIX + String(x) + String(y));

	switch (cell.getAttribute("val")) {
		case this.empty:
			cell.setAttribute("val", this.wall);
			cell.setAttribute("style", "background: " + BROWN);
			break;
		case this.wall:
			cell.setAttribute("val", this.end);
			cell.setAttribute("style", "background: " + RED);
			break;
		case this.end:
			cell.setAttribute("val", this.start);
			cell.setAttribute("style", "background: " + GREEN);
			break;
		case this.start:
			cell.setAttribute("val", this.empty);

			/* Can't just set colour back to white, depends on index. */
			if ((x+y)%2 == 0) {
				cell.setAttribute("style", "background: " + DEFAULT_CHEQUER);
			} else {
				cell.setAttribute("style", "background: white");
			}

			break;
	}
}

function populateSelect() {
	/* Populates both select inputs with defined constants. */

	var node, textNode, i;

	i = MIN_WIDTH;
	while (i <= MAX_WIDTH) {
		/* Create the node. */
		node = document.createElement("option");
		textNode = document.createTextNode(i);
		node.appendChild(textNode);
		node.setAttribute("value", String(i));

		/* Set defaults if they exist. */
		if (i == DEFAULT_WIDTH) {
			node.setAttribute("selected", "selected");
		}

		/* Add it to the width select menu by ID. */
		document.getElementById("widthSelect").appendChild(node);

		i++;
	}

	/* Do it again for height. */
	i = MIN_HEIGHT;
	while (i <= MAX_HEIGHT) {
		/* Create the node. */
		node = document.createElement("option");
		textNode = document.createTextNode(i);
		node.appendChild(textNode);
		node.setAttribute("value", String(i));

		/* Set defaults if they exist. */
		if (i == DEFAULT_HEIGHT) {
			node.setAttribute("selected", "selected");
		}

		/* Add it to the width select menu by ID. */
		document.getElementById("heightSelect").appendChild(node);

		i++;
	}
}

function killAllChildren(id) {
	/* Kill all children of ID. */
	var myNode = document.getElementById(id);

	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
}

/* Run on script load. */
populateSelect();

var elem = new FormElements(DEFAULT_PATH, DEFAULT_WALL, DEFAULT_END,
					        DEFAULT_START, DEFAULT_WIDTH, DEFAULT_HEIGHT);
