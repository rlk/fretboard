# Guitar Chord Voicing Explorer

Copyright &copy; 2016, 2025 [Robert Kooima](https://kooima.net)

The Guitar Chord Voicing Explorer presents an interactive guitar fretboard diagram. Select a root note and a set of chord tones to mark all relevant positions on the fretboard. Configure a chord by clicking to mark selected positions. This generates a <a href="http://lilypond.org">Lilypond</a> chord and fretboard diagram.

Fretboard controls create, delete, and reorder fretboard diagrams.

[Available for use on Github Pages](https://rlk.github.io/fretboard).

## Internals

A `tone` is a string that gives a scale degree and alteration. For example, `t6`, `t13`, and `t7ff` might all refer to the same pitch.

A `note` is a string that gives a note name and alteration. For example, `c`, `cs`, or `df`.

These `tone` and `note` strings are uniformly used as HTML element identifiers, CSS classes, image file names, and internal state representations.

### Fretboard

`currentRoot` selects the root of current chord on a fretboard.

`currentTone` is a 12-element, 0-indexed array that selects which role each of the 12 tones plays in the current chord. For example, element 9 may be a 6th, a 13th, or a flat-flat 7th. If a tone is unused, the element is `undefined`.

`currentMark` is a 6-element, 0-indexed array that selects one fret on each string to add to the chord voicing. If the string is unused, the element is `undefined`.

`positionElement` is a 6-row, 16-column, 0-indexed 2D array that holds the DOM element for each selectable position on the fretboard diagram.

`pitchElement` is a 12-element, 0-indexed array of lists that hold the `positionElement`s associated with a given pitch. For example, element 0, which is tone C, lists the `positionElement`s at fret 3 on the A string, fret 1 on the B string, etc.

### Explorer

`degreeElement` is a 12-element, 0-indexed array of the DOM elements of the labels on the chord tone selector.
