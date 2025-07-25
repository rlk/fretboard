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
		this.selectFretboard(new Fretboard(this));
		this.changePreset('Major');

		navigator.requestMIDIAccess().then(
			midi => this.midi = midi,
			message => console.log(`Failed to get MIDI access: ${message}`));
	}

	// Select a root note.
	selectRoot(note) {
		this.currentFretboard.setRoot(note);
		this.setToneMenuLabels();
	}

	// Assign a meaning to a pitch.
	selectTone(pitch, id) {
		this.currentFretboard.setTone(pitch, id)
		this.currentFretboard.update();
	}

	// Select a preset.
	changePreset(value) {
		var presets = {
			'Clear': {},
			'Minor': { 0: 't1', 3: 't3f', 7: 't5' },
			'Major': { 0: 't1', 4: 't3', 7: 't5' },
			'Suspended': { 0: 't1', 5: 't4', 7: 't5' },
			'Dominant 7': { 0: 't1', 4: 't3', 7: 't5', 10: 't7f' },
			'Dominant 9': { 0: 't1', 4: 't3', 7: 't5', 10: 't7f', 2: 't9' },
			'Dominant 13': { 0: 't1', 4: 't3', 7: 't5', 10: 't7f', 2: 't9', 9: 't13' },
			'Minor 7': { 0: 't1', 3: 't3f', 7: 't5', 10: 't7f' },
			'Minor 9': { 0: 't1', 3: 't3f', 7: 't5', 10: 't7f', 2: 't9' },
			'Minor 13': { 0: 't1', 3: 't3f', 7: 't5', 10: 't7f', 2: 't9', 9: 't13' },
			'Major 7': { 0: 't1', 4: 't3', 7: 't5', 11: 't7' },
			'Major 9': { 0: 't1', 4: 't3', 7: 't5', 11: 't7', 2: 't9' },
			'Major 13': { 0: 't1', 4: 't3', 7: 't5', 11: 't7', 2: 't9', 9: 't13' },
			'Augmented': { 0: 't1', 4: 't3', 8: 't5s' },
			'Augmented 7': { 0: 't1', 4: 't3', 8: 't5s', 10: 't7f' },
			'Diminished': { 0: 't1', 3: 't3f', 6: 't5f' },
			'Diminished 7': { 0: 't1', 3: 't3f', 6: 't5f', 9: 't7ff' },
		};

		var d = presets[value];

		if (d) {
			for (var i = 0; i < 12; i++) {
				this.currentFretboard.setTone(i, d[i]);
			}
			this.currentFretboard.update();
			this.setToneMenuValues();
		}
	}

	// Change the current fretboard to the given fretboard.
	selectFretboard(fb) {

		this.currentFretboard?.setSelected(false);
		this.currentFretboard = fb;
		this.currentFretboard?.setSelected(true);

		// Reset the tone menu.
		this.setToneMenuValues();
		this.setToneMenuLabels();

		// Set the root menu to match the new fretboard.
		document.getElementById(this.currentFretboard.getRoot()).checked = true;
	}

	// Insert a new fretboard after this one.
	insert() {
		this.selectFretboard(new Fretboard(this, this.currentFretboard));
	}

	// Relabel the tone menu using the current fretboard root.
	setToneMenuLabels() {
		for (var degree = 0; degree < 7; degree++)
			this.degreeElement[degree].innerHTML
				= htmlOfNote[keyOfNote[this.currentFretboard.getRoot()][degree]];
	}

	// Select the tone menu radio buttons to reflect the current fretboard state.
	setToneMenuValues() {
		for (var pitch = 0; pitch < 12; pitch++) {
			var id = this.currentFretboard.getTone(pitch);
			if (id) {
				document.getElementById(id).checked = true;
			} else {
				document.getElementById(`n${pitch}`).checked = true;
			}
		}
	}

	// Copy the given text to the clipboard.
	copy(text) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				if (text) {
					window.alert(`Copied LilyPond source to the clipboard:\n${text}`);
				}
			});
	}

	// Play the given MIDI notes.
	play(notes) {
		var noteOn = notes.map(note => [0x90, note, 0x7F]).flat();
		var noteOff = notes.map(note => [0x80, note, 0x7F]).flat();

		if (this.midi) {
			this.midi.outputs.forEach((output, port) => {
				output.send(noteOn);
				output.send(noteOff, window.performance.now() + 1000.0);
			});
		} else {
			window.alert('MIDI access was not granted.')
		}
	}
}

var currentExplorer = new Explorer();
