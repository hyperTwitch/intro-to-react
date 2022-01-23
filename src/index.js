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
		for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
			let row = [];
			for(let colIndex = 0; colIndex < 3; colIndex++) {
				// The current square we are looking at will by the row number * width of the board + the location of the square in the current row
				let squareToRender = rowIndex * 3 + colIndex;
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
			historyIsReversed: false
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
					winner: calculateWinner(squares),
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
				// column is determined by rounding down the square position divided by the board width (3)
				// row is determined by the square position mods the board width (3)
				desc = `Go to move #${move} (` + (step.squareForMove % 3) + "," + Math.floor(step.squareForMove / 3) + ")";
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
					<Board squares={current.squares} onClick={i => this.handleClick(i)} winHighlightList={winner ? winner.wonWith : false} />
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

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateFullBoard(squares) {
	return !(squares.includes(null));
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return { marker: squares[a], wonWith: lines[i] };
		}
	}
	return null;
}
