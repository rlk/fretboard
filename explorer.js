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

class Explorer {
	constructor() {
		this.currentFretboard = undefined;

		this.degreeElement = [];

		// Gather frequently used elements.
		this.degreeElement[0] = document.getElementById('degree1');
		this.degreeElement[1] = document.getElementById('degree2');
		this.degreeElement[2] = document.getElementById('degree3');
		this.degreeElement[3] = document.getElementById('degree4');
		this.degreeElement[4] = document.getElementById('degree5');
		this.degreeElement[5] = document.getElementById('degree6');
		this.degreeElement[6] = document.getElementById('degree7');

		// Instantiate an initial fretboard.
		this.selectFretboard(new Fretboard());
	}

	// Select a root note.
	changeRoot(id) {
		this.currentFretboard.currentRoot = id;
		this.currentFretboard.update();
	}

	// Select a chord tone.
	changeTone(i, id) {
		this.currentFretboard.currentTone[i] = id;
		this.currentFretboard.update();
	}

	// Select a preset.
	changePreset(value) {
		var presets = {
			'Clear': {},
			'Major': { 0: 't1', 4: 't3', 7: 't5' },
			'Minor': { 0: 't1', 3: 't3f', 7: 't5' },
			'6': { 0: 't1', 4: 't3', 7: 't5', 9: 't6' },
			'7': { 0: 't1', 4: 't3', 7: 't5', 10: 't7f' },
			'9': { 0: 't1', 4: 't3', 7: 't5', 10: 't7f', 2: 't9' },
			'13': { 0: 't1', 4: 't3', 7: 't5', 10: 't7f', 2: 't9', 9: 't13' },
			'Major 7': { 0: 't1', 4: 't3', 7: 't5', 11: 't7' },
			'Major 9': { 0: 't1', 4: 't3', 7: 't5', 11: 't7', 2: 't9' },
			'Major 13': { 0: 't1', 4: 't3', 7: 't5', 11: 't7', 2: 't9', 9: 't13' },
			'Minor 6': { 0: 't1', 3: 't3f', 7: 't5', 9: 't6' },
			'Minor 7': { 0: 't1', 3: 't3f', 7: 't5', 10: 't7f' },
			'Minor 9': { 0: 't1', 3: 't3f', 7: 't5', 10: 't7f', 2: 't9' },
			'Minor 13': { 0: 't1', 3: 't3f', 7: 't5', 10: 't7f', 2: 't9', 9: 't13' },
			'Augmented': { 0: 't1', 4: 't3', 8: 't5s' },
			'Augmented 7': { 0: 't1', 4: 't3', 8: 't5s', 10: 't7f' },
			'Diminished': { 0: 't1', 3: 't3f', 6: 't5f' },
			'Diminished 7': { 0: 't1', 3: 't3f', 6: 't5f', 9: 't7ff' },
			'Suspended': { 0: 't1', 5: 't4', 7: 't5' },
			'Suspended 7': { 0: 't1', 5: 't4', 7: 't5', 10: 't7f' },
			'Suspended 9': { 0: 't1', 5: 't4', 7: 't5', 10: 't7f', 2: 't9' },
		};

		var d = presets[value];

		if (d) {
			for (var i = 0; i < 12; i++)
				this.currentFretboard.currentTone[i] = d[i];

			this.currentFretboard.update();
			this.currentFretboard.setTones();
		}
	}

	// Change the current fretboard to the given fretboard.
	selectFretboard(fb) {

		// Add the current fretboard to the unselected class.
		if (this.currentFretboard)
			this.currentFretboard.item.className = "item unselected";

		// Add the new fretboard to the selected class.
		this.currentFretboard = fb;
		this.currentFretboard.item.className = "item selected";

		// Reset the tone menu.
		this.currentFretboard.setTones();
		this.setDegrees(this.currentFretboard.currentRoot);

		// Set the root menu to match the new fretboard.
		document.getElementById(this.currentFretboard.currentRoot).checked = true;
	}

	// Insert a new fretboard after this one.
	insert() {
		this.selectFretboard(new Fretboard(this));
	}

	// Relabel the tone menu for the selected key.
	setDegrees(currentRoot) {
		for (var d = 0; d < 7; d++)
			this.degreeElement[d].innerHTML = html[key[currentRoot][d]];
	}
}

var explorer = new Explorer();
