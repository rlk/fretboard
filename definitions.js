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

var pitchOfNote = {
  'cf': 11, 'c': 0, 'cs': 1,
  'df': 1, 'd': 2, 'ds': 3,
  'ef': 3, 'e': 4, 'es': 5,
  'ff': 4, 'f': 5, 'fs': 6,
  'gf': 6, 'g': 7, 'gs': 8,
  'af': 8, 'a': 9, 'as': 10,
  'bf': 10, 'b': 11, 'bs': 12,
};

var htmlOfNote = {
  'cf': "C&flat;",
  'c': "C",
  'cs': "C&sharp;",
  'df': "D&flat;",
  'd': "D",
  'ds': "D&sharp;",
  'ef': "E&flat;",
  'e': "E",
  'es': "E&sharp;",
  'ff': "F&flat;",
  'f': "F",
  'fs': "F&sharp;",
  'gf': "G&flat;",
  'g': "G",
  'gs': "G&sharp;",
  'af': "A&flat;",
  'a': "A",
  'as': "A&sharp;",
  'bf': "B&flat;",
  'b': "B",
  'bs': "B&sharp;",
};

var keyOfNote = {
  'cs': ['cs', 'ds', 'es', 'fs', 'gs', 'as', 'bs'],
  'fs': ['fs', 'gs', 'as', 'b', 'cs', 'ds', 'es'],
  'b': ['b', 'cs', 'ds', 'e', 'fs', 'gs', 'as'],
  'e': ['e', 'fs', 'gs', 'a', 'b', 'cs', 'ds'],
  'a': ['a', 'b', 'cs', 'd', 'e', 'fs', 'gs'],
  'd': ['d', 'e', 'fs', 'g', 'a', 'b', 'cs'],
  'g': ['g', 'a', 'b', 'c', 'd', 'e', 'fs'],
  'c': ['c', 'd', 'e', 'f', 'g', 'a', 'b'],
  'f': ['f', 'g', 'a', 'bf', 'c', 'd', 'e'],
  'bf': ['bf', 'c', 'd', 'ef', 'f', 'g', 'a'],
  'ef': ['ef', 'f', 'g', 'af', 'bf', 'c', 'd'],
  'af': ['af', 'bf', 'c', 'df', 'ef', 'f', 'g'],
  'df': ['df', 'ef', 'f', 'gf', 'af', 'bf', 'c'],
  'gf': ['gf', 'af', 'bf', 'cf', 'df', 'ef', 'f'],
  'cf': ['cf', 'df', 'ef', 'ff', 'gf', 'af', 'bf'],
}

var degreeOfTone = {
  't1': 0,
  't2f': 1,
  't2': 1,
  't3f': 2,
  't3': 2,
  't4': 3,
  't5f': 4,
  't5': 4,
  't5s': 4,
  't6f': 5,
  't6': 5,
  't7ff': 6,
  't7f': 6,
  't7': 6,
  't9f': 1,
  't9': 1,
  't9s': 1,
  't11f': 3,
  't11': 3,
  't11s': 3,
  't13f': 5,
  't13': 5,
}

var offsetOfTone = {
  't1': 0,
  't2f': -1,
  't2': 0,
  't3f': -1,
  't3': 0,
  't4': 0,
  't5f': -1,
  't5': 0,
  't5s': +1,
  't6f': -1,
  't6': 0,
  't7ff': -2,
  't7f': -1,
  't7': 0,
  't9f': -1,
  't9': 0,
  't9s': +1,
  't11f': -1,
  't11': 0,
  't11s': +1,
  't13f': -1,
  't13': 0,
}

// Return the pitch (0-11) at string (0=e 1=B 2=G 3=D 4=A 5=E) and fret.
function pitchAtPosition(string, fret) {
  switch (string) { // All fall through.
    case 0: fret = fret + 5;
    case 1: fret = fret + 4;
    case 2: fret = fret + 5;
    case 3: fret = fret + 5;
    case 4: fret = fret + 5;
  }
  return (fret + 4) % 12;
}

// Return the octave at string (0=e 1=B 2=G 3=D 4=A 5=E) and fret.
function octaveAtPosition(string, fret) {
  switch (string) { // All fall through.
    case 0: fret = fret + 5;
    case 1: fret = fret + 4;
    case 2: fret = fret + 5;
    case 3: fret = fret + 5;
    case 4: fret = fret + 5;
  }
  return 4 + Math.floor((fret - 8) / 12);
}

// Return the MIDI note (0-127) at string (0=e 1=B 2=G 3=D 4=A 5=E) and fret.
function noteAtPosition(string, fret) {
  switch (string) { // All fall through.
    case 0: fret = fret + 5;
    case 1: fret = fret + 4;
    case 2: fret = fret + 5;
    case 3: fret = fret + 5;
    case 4: fret = fret + 5;
  }
  return fret + 40;
}

// Apply an accidental to a pitch (0-11).
function offsetPitch(pitch, offset) {
  var r = pitch + offset;

  if (r < 0) {
    return offsetPitch(r + 12, 0)
  };
  if (r >= 12) {
    return offsetPitch(r - 12, 0)
  };
  return r;
}

// Return the tone string of the element at string s (0-5) fret f.
function toneAtPosition(string, fret) {
  if (fret < 10) return 's' + string.toString() + ' f0' + fret.toString();
  else return 's' + string.toString() + ' f' + fret.toString();
}

// Convert an octave number to the appropriate LilyPond syntax.
function getLilyPondOctave(octave) {
  switch (octave) {
    case 3: return ",";
    case 4: return "";
    case 5: return "'";
    case 6: return "''";
  }
}

// Convert an accidental number to the appropriate LilyPond syntax.
function getLilyPondAccidental(offset) {
  switch (offset) {
    case +1: return 's';
    case +0: return '';
    case -1: return 'f';
    case -2: return 'ff';
  }
}

// Simplify a LilyPond accidental string.
function simplifyLilyPondAccidental(s) {
  if (s.match('sf')) {
    return simplifyLilyPondAccidental(s.replace('sf', ''));
  }
  if (s.match('fs')) {
    return simplifyLilyPondAccidental(s.replace('fs', ''));
  }
  return s;
}
