import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
	return (
		<button className={"square" + props.winner} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(squareIndex, winHighlight) {
		return <Square key={squareIndex} value={this.props.squares[squareIndex]} onClick={() => this.props.onClick(squareIndex)} winner={winHighlight ? " winner" : ""} />;
	}

	render() {
		const board = [];
		for(let rowIndex = 0; rowIndex < this.props.boardSize; rowIndex++) {
			let row = [];
			for(let colIndex = 0; colIndex < this.props.boardSize; colIndex++) {
				// The current square we are looking at will by the row number * width of the board + the location of the square in the current row
				let squareToRender = rowIndex * this.props.boardSize + colIndex;
				let highlight = this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(squareToRender) >= 0 : false;
				row.push(this.renderSquare(squareToRender, highlight));
			}
			board.push(<div key={rowIndex} className="board-row">{row}</div>);
		}
		return <div>{board}</div>;
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
					squareForMove: null,
					winner: false,
					fullBoard: false
				}
			],
			stepNumber: 0,
			xIsNext: true,
			historyIsReversed: false,
			boardSize: this.props.boardSize
		};
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		// exit early if there is already a winner or if square is already filled
		if (squares[i] || !(!current.winner)) {
			return;
		}

		// otherwise, set value for square
		squares[i] = this.state.xIsNext ? "X" : "O";
		this.setState({
			history: history.concat([
				{
					squares: squares,
					squareForMove: i,
					winner: calculateWinner(squares, this.state.boardSize),
					fullBoard: calculateFullBoard(squares)
				}
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0	// is the move number is evenly divisible by 2 then X is next
		});
	}

	changeHistoryOrder() {
		this.setState( {
			historyIsReversed: !this.state.historyIsReversed
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = current.winner;
		const fullBoard = current.fullBoard;

		// create a history of moves list to display
		const moves = history.map((step, move) => {
			const winnerStep = step.winner;
			const fullStep = step.fullBoard;

			// Determine the button description based on the state of the game
			let desc;
			if (move === 0) {
				desc = "Go to game start";
			}
			// If this history item is the most recent move and the board is in a winner state, mark it
			else if (winnerStep) {
				desc = `Go to ${winnerStep.marker} won`;
			}
			// If this history item is the most recent move and the board is full, mark it
			else if (fullStep) {
				desc = "Go to game over";
			}
			// Otherwise, add the move to the list along with the (x,y) position that was taken during the move
			else {
				// column is determined by rounding down the square position divided by the board width
				// row is determined by the square position mods the board width
				desc = `Go to move #${move} (` + (step.squareForMove % this.state.boardSize) + "," + Math.floor(step.squareForMove / this.state.boardSize) + ")";
			}
			return (
				<li key={move}>
					<button className={this.state.stepNumber === move ? "currentStep" : ""} onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		// reverse the history if it should be
		if(this.state.historyIsReversed) {
			moves.reverse();
		}

		// check if anyone has won in the most recent state
		let status;
		if (winner) {
			status = "Winner: " + winner.marker;
		}
		else if(fullBoard) {
			status = 'Draw: No more moves';
		}
		else {
			status = "Next player: " + (this.state.xIsNext ? "X" : "O");
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board squares={current.squares} onClick={i => this.handleClick(i)} winHighlightList={winner ? winner.wonWith : false} boardSize={this.state.boardSize} />
				</div>
				<div className="game-info">
					<div>{status}</div>
					<button onClick={() => this.changeHistoryOrder()}>Reverse History Order</button>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(<React.StrictMode><Game boardSize={5} /></React.StrictMode>, document.getElementById("root"));

function calculateFullBoard(squares) {
	return !(squares.includes(null));
}

// check diagonal left to right for winner
function checkLeftRightDiagonalForWinner(squares, boardSize) {
	let markerToMatch = squares[0];		// start with the top left corner position
	let foundMarkers = [0];
	let checkPosition = boardSize + 1;

	// while the top left corner isn't null, the spot matches the top left corner, and it's within the bounds of the board, add it to the list and keep going
	while(markerToMatch != null && squares[checkPosition] === markerToMatch && checkPosition < boardSize * boardSize) {
		foundMarkers.push(checkPosition);
		checkPosition += boardSize + 1;
	}

	// if the number of matches equals the size of the board, then a winner was found and return the winner
	if(foundMarkers.length === boardSize) {
		return { marker: markerToMatch, wonWith: foundMarkers };
	}
	// otherwise, no winner found return false
	else {
		return false;
	}
}

// check diagonal right to left for winner
function checkRightLeftDiagonalForWinner(squares, boardSize) {
	let markerToMatch = squares[boardSize - 1];
	let foundMarkers = [boardSize - 1];
	let checkPosition = 2 * boardSize - 2;

	// while the top right corner isn't null, the spot matches the top right corner, and it's within the boards of the board, add it to the list and keep going
	while(markerToMatch != null && squares[checkPosition] === markerToMatch && checkPosition < boardSize * boardSize) {
		foundMarkers.push(checkPosition);
		checkPosition += boardSize - 1;
	}

	// if the number of matches equals the size of the board, then a winner was found and return the winner
	if(foundMarkers.length === boardSize) {
		return { marker: markerToMatch, wonWith: foundMarkers };
	}
	// otherwise, no winner found return false
	else {
		return false;
	}
}

// check all rows for winner
function checkRowsForWinner(squares, boardSize) {
	let markerToMatch = null;
	let foundMarkers = [];

	for(let checkFirstInRow = 0; checkFirstInRow < boardSize * boardSize; checkFirstInRow += boardSize) {
		// retrieved square is the first in each row
		// if the first square in the row is empty, check the next row
		if(squares[checkFirstInRow] == null) {
			continue;
		}
		// otherwise, set the marker to match and see if the rest of the squares in the row match
		else {
			markerToMatch = squares[checkFirstInRow];
			foundMarkers.push(checkFirstInRow);

			for(let checkRow = checkFirstInRow + 1; checkRow < checkFirstInRow + boardSize; checkRow++) {
				// if any of the subsequent squares in the row don't match the first, reset items to look for and exit loop
				if(squares[checkRow] !== markerToMatch) {
					markerToMatch = null;
					foundMarkers = [];
					break;
				}
				// otherwise, add the new match to the list and keep going
				else {
					foundMarkers.push(checkRow);
				}
			}

			// if a row where all markers match was found, return the winner
			if(foundMarkers.length === boardSize) {
				return { marker: markerToMatch, wonWith: foundMarkers };
			}
		}
	}

	// if we made it through all the board rows without finding a winner, then no winner return false
	return false;
}

// check all columns for winner
function checkColumnsForWinner(squares, boardSize) {
	let markerToMatch = null;
	let foundMarkers = [];

	for(let checkFirstInCol = 0; checkFirstInCol < boardSize; checkFirstInCol++) {
		// retrieved square is the first in each column
		// if the first square in the column is empty, check the next column
		if(squares[checkFirstInCol] == null) {
			continue;
		}
		// otherwise, set the marker to match and see if the rest of the squares in the column match
		else {
			markerToMatch = squares[checkFirstInCol];
			foundMarkers.push(checkFirstInCol);

			for(let checkCol = checkFirstInCol + boardSize; checkCol < boardSize * boardSize; checkCol += boardSize) {
				// if any of the subsequent squares in the column don't match the first, reset items to loop for and exit loop
				if(squares[checkCol] !== markerToMatch) {
					markerToMatch = null;
					foundMarkers = [];
					break;
				}
				// otherwise, add the new match to the list and keep going
				else {
					foundMarkers.push(checkCol);
				}
			}

			// if a column where all markers match was found, return the winner
			if(foundMarkers.length === boardSize) {
				return { marker: markerToMatch, wonWith: foundMarkers };
			}
		}
	}

	// if we made it through all the board columns without finding a winnner, then no winner return false
	return false;
}

function calculateWinner(squares, boardSize) {
	const leftRightDiagonal = checkLeftRightDiagonalForWinner(squares, boardSize);
	if(leftRightDiagonal) {
		return leftRightDiagonal;
	}

	const rightLeftDiagonal = checkRightLeftDiagonalForWinner(squares, boardSize);
	if(rightLeftDiagonal) {
		return rightLeftDiagonal;
	}

	const rows = checkRowsForWinner(squares, boardSize);
	if(rows) {
		return rows;
	}

	const cols = checkColumnsForWinner(squares, boardSize);
	if(cols) {
		return cols;
	}

	return false;
}
