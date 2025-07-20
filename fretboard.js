// Copyright (c) 2016, 2025 Robert Kooima
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

class Fretboard {
	constructor(explorer) {
		this.maxFret = 16;

		// Initialize the current state.
		this.currentRoot = 'c';
		this.currentTone = [];
		this.currentMark = [];

		for (var i = 0; i < 12; i++)
			this.currentTone[i] = undefined;

		for (var i = 0; i < 6; i++)
			this.currentMark[i] = undefined;

		// Frequently accessed DOM elements.
		this.positionElement = [[], [], [], [], [], []];
		this.pitchElement = [[], [], [], [], [], [], [], [], [], [], [], []];

		// Initalize the DOM for this fretboard.
		this.buildDocument(explorer);
		this.update();

		// Add the new fretboard to the document.

		// if (that)
		// 	document.getElementById("fretboards").insertBefore(this.item, that.item.nextSibling);
		// else
		document.getElementById("fretboards").appendChild(this.item);
	}

	// Build the fretboard table.
	buildDocument(explorer) {
		var item = document.createElement('div');
		var table = document.createElement('table');
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		var heading = document.createElement('div');
		var insert = document.createElement('span');
		var moveup = document.createElement('span');
		var movedn = document.createElement('span');
		var remove = document.createElement('span');
		var diagram = document.createElement('input');
		var grid = document.createElement('input');

		item.className = 'item';
		table.className = 'fretboard';
		insert.className = 'control';
		remove.className = 'control';
		moveup.className = 'control';
		movedn.className = 'control';
		heading.className = 'heading';
		grid.className = 'display';
		diagram.className = 'display';

		grid.type = 'text';
		diagram.type = 'text';

		table.appendChild(thead);
		table.appendChild(tbody);

		// Build the fretboard controls.
		heading.appendChild(remove);
		heading.appendChild(moveup);
		heading.appendChild(movedn);
		heading.appendChild(insert);
		heading.appendChild(grid);
		heading.appendChild(diagram);

		insert.innerHTML = '&plus;';
		remove.innerHTML = '&times;';
		moveup.innerHTML = '&uarr;';
		movedn.innerHTML = '&darr;';

		insert.title = 'Add Fretboard';
		remove.title = 'Delete Fretboard';
		moveup.title = 'Move Up';
		movedn.title = 'Move Down';

		insert.addEventListener('click', () => explorer.insert());
		remove.addEventListener('click', () => this.remove());
		moveup.addEventListener('click', () => this.moveup());
		movedn.addEventListener('click', () => this.movedn());

		// Build the fret numbering.
		var tr = document.createElement('tr');

		thead.appendChild(tr);

		for (var f = 0; f < this.maxFret; f++) {
			var th = document.createElement('th');
			th.textContent = f;
			tr.appendChild(th);
		}

		// Build the fretboard table.
		for (var s = 0; s < 6; s++) {
			var tr = document.createElement('tr');

			tbody.appendChild(tr);

			for (var f = 0; f < this.maxFret; f++) {
				var td = document.createElement('td');
				var div = document.createElement('div');

				this.positionElement[s][f] = div;
				this.pitchElement[pitchAtPosition(s, f)].push(div);

				div.addEventListener('click', this.makeNoteToggler(this, s, f));

				td.className = classAtPosition(s, f);

				td.appendChild(div);
				tr.appendChild(td);
			}
		}

		item.appendChild(heading);
		item.appendChild(table);
		item.addEventListener('mouseup', () => explorer.selectFretboard(this))

		this.diagram = diagram;
		this.grid = grid;
		this.item = item;
	}

	makeNoteToggler(fretboard, s, f) {
		return function (event) {
			fretboard.toggleNote(s, f);
		}
	}

	// Null the className on all position elements.
	clearClassNames() {
		for (var s = 0; s < 6; s++)
			for (var f = 0; f < this.maxFret; f++)
				this.positionElement[s][f].className = "";
	}

	// Select or deselect this fretboard.
	setSelected(selected) {
		if (selected) {
			this.item.className = "item selected";
		} else {
			this.item.className = "item unselected";
		}
	}

	// Set the class on the marked positions. Remove invalid marks.
	setMarks() {
		for (var s = 0; s < 6; s++) {
			if (typeof this.currentMark[s] === 'number') {
				var e = this.positionElement[s][this.currentMark[s]];

				if (e.className)
					e.className += ' marked';
				else
					this.currentMark[s] = 'undefined';
			}
		}
	}

	// Set the classes on all position elements to show the selection.
	setPositions() {
		for (var i = 0; i < 12; i++) {
			var t = this.currentTone[i];
			if (t) {
				var d = tone[t].degree;
				var a = tone[t].offset;
				var k = offsetPitch(pitch[key[this.currentRoot][d]], a);

				for (var j = 0; j < this.pitchElement[k].length; j++)
					this.pitchElement[k][j].className = t;
			}
		}
	}

	// Compute the LilyPond diagram for the current selection.
	setDiagram() {
		var chord = [];
		var diagram = [];

		for (var s = 6 - 1; s >= 0; s--) {
			if (typeof this.currentMark[s] === 'number') {
				var e = this.positionElement[s][this.currentMark[s]];
				var t = e.className.split(' ')[0];
				var d = tone[t].degree;
				var a = tone[t].offset;
				var o = octaveAtPosition(s, this.currentMark[s]);

				var n = key[this.currentRoot][d][0];
				var f = key[this.currentRoot][d].substring(1);

				chord.push(n + simplifyLilyPondAccidental(f + getLilyPondAccidental(a)) + getLilyPondOctave(o));

				if (this.currentMark[s] > 0)
					diagram.push(this.currentMark[s] + ';');
				else
					diagram.push('o' + ';');
			} else
				diagram.push('x;');
		}

		if (chord.length > 0)
			this.diagram.value = '<' + chord.join(' ') + '>'
				+ '1^\\markup { \\fret-diagram-terse #"' + diagram.join('') + '" }'
	}

	// Compute the Chord Grid for the current selection.
	setGrid() {
		var stops = [];
		var min = this.maxFret;
		var max = 0;
		var ref = 0;

		for (var s = 6 - 1; s >= 0; s--) {
			if (typeof this.currentMark[s] === 'number') {
				var e = this.positionElement[s][this.currentMark[s]];
				var t = e.className.split(' ')[0];
				var d = tone[t].degree;

				stops.push('+:' + (s + 1) + ':' + this.currentMark[s]);

				if (min > this.currentMark[s])
					min = this.currentMark[s];
				if (max < this.currentMark[s])
					max = this.currentMark[s];
				if (ref == 0 && d == 0)
					ref = this.currentMark[s]
			}
		}

		if (stops.length > 0) {
			var grid = [];
			grid.push('_:6:' + min);
			grid.push('_:1:' + max);

			if (ref > 0)
				grid.push('F:' + ref);
			else
				grid.push('F:' + min);

			this.grid.value = '<span class="grid">' + grid.concat(stops).join(' ') + '</span>';
		}
	}

	// Set the current root id.
	setRoot(id) {
		this.currentRoot = id;
		this.update();
	}

	// Get the current root id.
	getRoot() {
		return this.currentRoot;
	}

	// Set the meaning of the given pitch.
	setTone(pitch, id) {
		this.currentTone[pitch] = id;
		this.update();
	}

	// Get the meaning of the given pitch, or undefined if the pitch is unused.
	getTone(pitch) {
		return this.currentTone[pitch];
	}

	// Update the DOM to reflect the current state.
	update() {
		this.clearClassNames();
		this.setPositions();
		this.setMarks();
		this.setDiagram();
		this.setGrid();
	}

	// Toggle the mark on a position.
	toggleNote(s, f) {
		if (this.positionElement[s][f].className.length > 0) {
			if (this.currentMark[s] == f)
				this.currentMark[s] = undefined;
			else
				this.currentMark[s] = f;
			this.update();
		}
	}

	// Remove this item (if it's not the only one left).
	remove() {
		if (document.getElementsByClassName("item").length > 1)
			this.item.remove();
	}

	// Shift this item up in the document order.
	moveup() {
		var curr = this.item;
		var prev = this.item.previousSibling;

		if (prev && prev.tagName === 'DIV')
			document.getElementById("fretboards").insertBefore(curr, prev);
	}

	// Shift this item down in the document order.
	movedn() {
		var curr = this.item;
		var next = this.item.nextSibling;

		if (next && next.tagName === 'DIV')
			document.getElementById("fretboards").insertBefore(next, curr);
	}
}
