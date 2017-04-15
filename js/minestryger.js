(function (window, $, undefined) {

var Cell = function () {
	this.count = 0;
	this.hasBomb = false;
	this.isFlagged = false;
	this.isTurned = false;
}

var Playfield = function (height, width) {
	this.width = width;
	this.height = height;
	this.rows = [];
	for(var i = 0; i < height; i += 1) {
		this.rows[i] = [];
		for(var j = 0; j < width; j += 1) {
			this.rows[i][j] = new Cell();
		}
	}
}

Playfield.prototype = {
	coordsAreLegal : function (row, column) {
		if (row < 0 || row > this.height - 1) { return false; }
		if (column < 0 || column > this.width -1) { return false; }
		return true;
	},
	getElement : function (row, column) {
		return $($('.mcell')[row * this.width + column]);
	},
	incrementCell : function (row, column) {
		if (!this.coordsAreLegal(row, column)) {
			return false;
		}
		this.rows[row][column].count += 1;
		return true;
	},
	setBombs : function (bombCount) {
		this.bombCount = bombCount;
		this.bombsLeft = bombCount;
		
		let tmpAllIndexes = [],
			cellCount = this.height * this.width;
		for(var i = 0; i < cellCount; i += 1) {
			tmpAllIndexes.push(i);
		}
		tmpAllIndexes.sort(function (a,b) {
			return Math.random() - 0.5;
		});
		for (var i=0; i < bombCount; i += 1) {
			var nextBombIndex = tmpAllIndexes.shift(),
				rowIndex = parseInt(Math.floor(nextBombIndex / this.width), 10),
				columnIndex = nextBombIndex % this.width;
			this.rows[rowIndex][columnIndex].hasBomb = true;
			// go add the numbers on ajecant fields;
			this.incrementCell(rowIndex-1,columnIndex-1);
			this.incrementCell(rowIndex-1,columnIndex);
			this.incrementCell(rowIndex-1,columnIndex+1);
			this.incrementCell(rowIndex,columnIndex-1);
			this.incrementCell(rowIndex,columnIndex+1);
			this.incrementCell(rowIndex+1,columnIndex-1);
			this.incrementCell(rowIndex+1,columnIndex);
			this.incrementCell(rowIndex+1,columnIndex+1);
		}
		console.log(this.toString());
	},
	turnCell : function (row, column) {
		var thisCell = this.rows[row][column];
		thisCell.isTurned = true;
		this.getElement(row, column)
			.html(thisCell.count)
			.addClass('turned');
			
	},
	turnIfZero : function (row, column) {
		if (!this.coordsAreLegal(row, column)) {
			return false;
		}
		var thisCell = this.rows[row][column];
		if (thisCell.isTurned) return true;
		if (thisCell.count === 0) {
			this.turnCell(row, column);
			this.goClearZeroes(row, column);
		} else {
			this.turnCell(row, column);
		}
	},
	goClearZeroes : function(row, column) {
		this.turnIfZero(row-1,column-1);
		this.turnIfZero(row-1,column);
		this.turnIfZero(row-1,column+1);
		this.turnIfZero(row,column-1);
		this.turnIfZero(row,column+1);
		this.turnIfZero(row+1,column-1);
		this.turnIfZero(row+1,column);
		this.turnIfZero(row+1,column+1);
	},
	onclick : function (e) {
		var $target = $(e.target);
		if ($target.hasClass('mcell') && !$target.hasClass('flagged')) {
			var clickedId = $(e.target).attr('id'),
				coords = clickedId.substr(1).split('_'),
				row = parseInt(coords[0], 10),
				column = parseInt(coords[1], 10),
				thisCell = this.rows[row][column];
			if (thisCell.isTurned) {
				return;
			}
			$(e.target)
				.addClass('turned')
				.html(thisCell.hasBomb ? '<span class="fa fa-bomb red"></span>' : thisCell.count);
			thisCell.isTurned = true;
			if (thisCell.hasBomb) {
				$(e.target).closest('.mcell').css({'background-color': '#faa'});
			} else {
				if (thisCell.count === 0) {
					this.goClearZeroes(row, column);
				}
			}
		}
	},
	onrightclick: function (e) {
		$target = $(e.target).closest('.mcell');
		if ($target.length > 0) {
			e.preventDefault();
			var clickedId = $target.attr('id'),
				coords = clickedId.substr(1).split('_'),
				row = parseInt(coords[0], 10),
				column = parseInt(coords[1], 10),
				thisCell = this.rows[row][column];
			thisCell.isFlagged = !thisCell.isFlagged;
			if (!thisCell.isTurned) {
				if (thisCell.isFlagged) {
					$target
						.addClass('flagged')
						.html('<span class="fa fa-exclamation-circle"></span>');
				} else {
					$target
						.removeClass('flagged')
						.html('');
				}
			}
		}
		return false;
	},
	toString : function () {
		var tmpStr = 'Playfield:\n';
		for (var i = 0; i < this.height; i += 1) {
			tmpStr += '['
			for (var j = 0; j < this.width; j += 1) {
				var cell = this.rows[i][j];
				tmpStr += cell.hasBomb ? 'B' : cell.count;
			}
			tmpStr += ']\n';
		}
		return tmpStr;
	}
}


var Minestryger = function (height, width, mineCount) {
	this.playfield = new Playfield(height, width);
	this.playfield.setBombs(mineCount);
	// set up playfield
	var tmpHtmlStr = '';
	for (var i = 0; i < height; i += 1){
		tmpHtmlStr += '<div class="mrow">';
		for (var j = 0; j < width; j += 1) {
			tmpHtmlStr += `\t<div id="c${i}_${j}" class="mcell"></div>`;
		}
		tmpHtmlStr += '</div>';
	}
	$('.battlefield').html(tmpHtmlStr);
	// set up click handler
	$('.battlefield').click(this.playfield.onclick.bind(this.playfield));
	$('.battlefield').on('contextmenu', this.playfield.onrightclick.bind(this.playfield));
}

window.m = {
	Playfield: Playfield,
	Minestryger: Minestryger,
	Cell: Cell
};

})(window, jQuery);

$(document).ready(function () {
	var minefelt = new m.Minestryger(20,36,38);
});
