// Load needed libraries.
var accounting = require(WPATH('accounting'));

// Load widget global variables.
var isOpen = false,
	activeLabel,
	activeShakeView,
	maxLength = 10;

/*
 * Event Listeners
 */

// Handles clicking of the done button.
function doDoneBtnClick() {
	close();
}

// Handles clicking of any of the keyboard entry buttons.
function doNumberBtnClick(e) {
	var keyHit = e.source.title;
	if (keyHit === '00') {
		handleDoubleZeroInsertion();
	} else if (keyHit === '<') {
		handleBackspace();
	} else {
		handleNumber(keyHit);
	}
}

/*
 * Internal Methods
 */

// User hit a number, 0-9.
function handleNumber(numToProcess) {
	// Handle an attempt to stay at zero.
	if (numToProcess == '0' && activeLabel.text == '0.00') {
		return;
	}
	// Handle the number getting too big.
	if ((activeLabel.text + '1').length > maxLength) {
		return shake(activeShakeView);
	}
	var previousValue = activeLabel.text;
	// Handle previous single-digit value.
	if (previousValue.substring(0, 3) == '0.0') {
		return activeLabel.text = '0.' + previousValue.substring(previousValue.length - 1) + numToProcess;
	}
	// Handle everything else! :)
	newValue = previousValue.replace(".", "");
	newValue = newValue + numToProcess;
	newValue = newValue.slice(0, -2) + "." + newValue.slice(-2);
	newValue = newValue.replace(/^0+/, '');
	newValue = accounting.formatMoney(newValue, {
		symbol: ""
	});
	activeLabel.text = newValue;
}

// User hit the backspace key.
function handleBackspace() {
	newValue = activeLabel.text;
	newValue = newValue.replace(".", "");
	newValue = newValue.substring(0, newValue.length - 1);
	newValue = newValue.slice(0, -2) + "." + newValue.slice(-2);
	newValue = accounting.formatMoney(newValue, {
		symbol: ""
	});
	activeLabel.text = newValue;
}

// User hit a double-zero insertion.
function handleDoubleZeroInsertion() {
	// Do nothing if already 0.
	if (activeLabel.text == '0.00') {
		return;
	}
	// Handle the number getting too big.
	if ((activeLabel.text + '2').length > maxLength) {
		return shake(activeShakeView);
	}
	// Insert the double-zeros.
	newValue = activeLabel.text.replace(".", "");
	newValue = newValue + '.00';
	newValue = accounting.formatMoney(newValue, {
		symbol: ""
	});
	activeLabel.text = newValue;
}

// Used to make sure animation speed is consistent across platforms.
function calcAnimationSpeed(animationSpeed) {
	if (OS_IOS) {
		return animationSpeed;
	} else {
		return animationSpeed / 2;
	}
}

// Used to open the keyboard.
function open(callback) {
	if (typeof callback !== 'function') {
		callback = function () {};
	}
	if (isOpen) {
		return;
	}
	isOpen = true;
	$.container.animate({
		bottom: 0,
		duration: calcAnimationSpeed(325)
	}, function () {
		callback();
	});
}

// Used to close the keyboard.
function close(callback) {
	if (typeof callback !== 'function') {
		callback = function () {};
	}
	isOpen = false;
	$.container.animate({
		bottom: -($.container.height),
		duration: calcAnimationSpeed(325)
	}, function () {
		callback();
	});
}

// Used to set the label to run the button events against.
function setActiveLabel(inputLabel) {
	activeLabel = inputLabel;
}

// Used to set the label to run the button events against.
function setErrorShakeView(inputView) {
	activeShakeView = inputView;
}

// Used to shake the label when the number gets too long.
function shake(view) {
	var animation = require('alloy/animation');
	animation.shake(view, 30);
}

/*
 * External Method Pointers
 */

exports.open = open;
exports.close = close;
exports.setActiveLabel = setActiveLabel;
exports.setErrorShakeView = setErrorShakeView;
exports.isOpen = function () { return isOpen; };