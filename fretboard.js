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
	constructor(explorer, that) {
		this.maxFret = 16;

		// Initialize the current state.
		this.currentRoot = 'c';
		this.currentTone = [];
		this.currentMark = [];
		this.pitchElement = [];
		this.positionElement = [];

		for (var id = 0; id < 12; id++) {
			this.currentTone[id] = undefined;
			this.pitchElement[id] = [];
		}

		for (var string = 0; string < 6; string++) {
			this.currentMark[string] = undefined;
			this.positionElement[string] = [];
		}

		// Initalize the DOM for this fretboard.
		this.buildDocument(explorer);
		this.update();

		// Add the new fretboard to the document.
		if (that) {
			document.getElementById("fretboards").insertBefore(this.item, that.item.nextSibling);
		} else {
			document.getElementById("fretboards").appendChild(this.item);
		}
	}

	// Build the fretboard table.
	buildDocument(explorer) {
		var item = document.createElement('div');
		var panel = document.createElement('div');
		var table = document.createElement('table');
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		var insert = document.createElement('span');
		var moveup = document.createElement('span');
		var movedn = document.createElement('span');
		var remove = document.createElement('span');
		var makelp = document.createElement('span');
		var playmd = document.createElement('span');

		item.className = 'item';
		panel.className = 'panel';
		table.className = 'fretboard';
		insert.className = 'control';
		remove.className = 'control';
		moveup.className = 'control';
		movedn.className = 'control';
		makelp.className = 'control';
		playmd.className = 'control';

		table.appendChild(thead);
		table.appendChild(tbody);

		// Build the fretboard control panel elements.

		insert.innerHTML = '&plus;';
		remove.innerHTML = '&times;';
		moveup.innerHTML = '&uarr;';
		movedn.innerHTML = '&darr;';
		makelp.innerHTML = '&#8466;';
		playmd.innerHTML = '&#9658;';

		insert.title = 'Add Fretboard';
		remove.title = 'Delete Fretboard';
		moveup.title = 'Move Up';
		movedn.title = 'Move Down';
		makelp.title = 'Copy LilyPond diagram';
		playmd.title = 'Play MIDI';

		insert.addEventListener('click', () => explorer.insert());
		remove.addEventListener('click', () => this.remove());
		moveup.addEventListener('click', () => this.moveup());
		movedn.addEventListener('click', () => this.movedn());
		makelp.addEventListener('click', () => explorer.copy(this.makeLilyPond()));

		var panel = [ playmd, insert, moveup, movedn, makelp, remove ];

		// Build the fret numbering.
		var tr = document.createElement('tr');
		var th = document.createElement('th');

		thead.appendChild(tr);
		tr.appendChild(th);

		for (var fret = 0; fret < this.maxFret; fret++) {
			var th = document.createElement('th');
			th.textContent = fret;
			tr.appendChild(th);
		}

		// Build the fretboard table.
		for (var string = 0; string < 6; string++) {
			var tr = document.createElement('tr');
			var th = document.createElement('th');

			th.className = 'panel'
			tr.appendChild(th);
			th.appendChild(panel[string]);

			for (var fret = 0; fret < this.maxFret; fret++) {
				var pitch = pitchAtPosition(string, fret);
				var td = document.createElement('td');
				var div = document.createElement('div');

				this.positionElement[string][fret] = div;
				this.pitchElement[pitch].push(div);

				div.addEventListener('click', this.makeNoteToggler(this, string, fret));

				td.className = toneAtPosition(string, fret);
				td.appendChild(div);
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}

		// item.appendChild(panel);
		item.appendChild(table);
		item.addEventListener('mouseup', () => explorer.selectFretboard(this))

		this.item = item;
	}

	makeNoteToggler(fretboard, string, fret) {
		return function (event) {
			fretboard.toggleNote(string, fret);
		}
	}

	// Null the className on all position elements.
	clrMarks() {
		for (var string = 0; string < 6; string++) {
			for (var fret = 0; fret < this.maxFret; fret++) {
				this.positionElement[string][fret].className = "";
			}
		}
	}

	// Set the class on the marked positions. Remove invalid marks.
	setMarks() {
		for (var string = 0; string < 6; string++) {
			if (typeof this.currentMark[string] === 'number') {
				this.positionElement[string][this.currentMark[string]].classList.add('marked');
			}
		}
	}

	// Set the classes on all position elements to show the selection.
	setPositions() {
		this.currentTone.forEach(tone => {
			if (tone) {
				var degree = degreeOfTone[tone];
				var offset = offsetOfTone[tone];
				var pitch = offsetPitch(pitchOfNote[keyOfNote[this.currentRoot][degree]], offset);

				this.pitchElement[pitch].forEach(element => element.classList.add(tone));
			}
		});
	}

	// Update the DOM CSS classes to reflect the current state.
	update() {
		this.clrMarks();
		this.setPositions();
		this.setMarks();
	}

	// Set the current root note.
	setRoot(note) {
		this.currentRoot = note;
		this.update();
	}

	// Get the current root id.
	getRoot() {
		return this.currentRoot;
	}

	// Set the meaning of the given pitch.
	setTone(pitch, id) {
		this.currentTone[pitch] = id;
	}

	// Get the meaning of the given pitch, or undefined if the pitch is unused.
	getTone(pitch) {
		return this.currentTone[pitch];
	}

	// Toggle the mark on a position.
	toggleNote(string, fret) {
		if (this.positionElement[string][fret].className.length > 0) {
			if (this.currentMark[string] == fret) {
				this.currentMark[string] = undefined;
			} else {
				this.currentMark[string] = fret;
			}
			this.update();
		}
	}

	// Select or deselect this fretboard.
	setSelected(selected) {
		if (selected) {
			this.item.className = "item selected";
		} else {
			this.item.className = "item unselected";
		}
	}

	// Remove this item (if it's not the only one left).
	remove() {
		if (document.getElementsByClassName("item").length > 1) {
			this.item.remove();
		}
	}

	// Shift this item up in the document order.
	moveup() {
		var curr = this.item;
		var prev = this.item.previousSibling;

		if (prev && prev.tagName === 'DIV') {
			document.getElementById("fretboards").insertBefore(curr, prev);
		}
	}

	// Shift this item down in the document order.
	movedn() {
		var curr = this.item;
		var next = this.item.nextSibling;

		if (next && next.tagName === 'DIV') {
			document.getElementById("fretboards").insertBefore(next, curr);
		}
	}

	// Compute the LilyPond diagram for the current selection.
	makeLilyPond() {
		var chord = [];
		var diagram = [];

		for (var string = 6 - 1; string >= 0; string--) {
			if (typeof this.currentMark[string] === 'number') {
				var fret = this.currentMark[string];
				var tone = this.positionElement[string][fret].classList[0];

				var degree = degreeOfTone[tone];
				var offset = offsetOfTone[tone];
				var octave = octaveAtPosition(string, fret);

				var note = keyOfNote[this.currentRoot][degree][0];
				var flat = keyOfNote[this.currentRoot][degree].substring(1);

				chord.push(note
					+ simplifyLilyPondAccidental(flat + getLilyPondAccidental(offset))
					+ getLilyPondOctave(octave));

				if (fret > 0) {
					diagram.push(`${fret};`);
				} else {
					diagram.push('o;');
				}
			} else {
				diagram.push('x;');
			}
		}

		if (chord.length > 0) {
			return `<${chord.join(' ')}> 1^\\markup { \\fret-diagram-terse #"${diagram.join('')}" }`
		} else {
			return undefined;
		}
	}
}
