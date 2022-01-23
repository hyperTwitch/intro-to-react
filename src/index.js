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
	renderSquare(i, winHighlight) {
		return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)} winner={winHighlight ? " winner" : ""} />;
	}

	render() {
		return (
			<div>
				<div className="board-row">
					{this.renderSquare(0, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(0) >= 0 : false)}
					{this.renderSquare(1, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(1) >= 0 : false)}
					{this.renderSquare(2, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(2) >= 0 : false)}
				</div>
				<div className="board-row">
					{this.renderSquare(3, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(3) >= 0 : false)}
					{this.renderSquare(4, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(4) >= 0 : false)}
					{this.renderSquare(5, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(5) >= 0 : false)}
				</div>
				<div className="board-row">
					{this.renderSquare(6, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(6) >= 0 : false)}
					{this.renderSquare(7, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(7) >= 0 : false)}
					{this.renderSquare(8, this.props.winHighlightList !== false ? this.props.winHighlightList.indexOf(8) >= 0 : false)}
				</div>
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
					squareForMove: null
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
		if (calculateWinner(squares) || squares[i]) {
			return;
		}

		// otherwise, set value for square
		squares[i] = this.state.xIsNext ? "X" : "O";
		this.setState({
			history: history.concat([
				{
					squares: squares,
					squareForMove: i
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
		const winner = calculateWinner(current.squares);
		const fullBoard = calculateFullBoard(current.squares);

		// create a history of moves list to display
		const moves = history.map((step, move) => {
			// Determine the button description based on the state of the game
			let desc;
			if (move === 0) {
				desc = "Go to game start";
			}
			// If this history item is the most recent move and the board is in a winner state, mark it
			else if (move === history.length - 1 && winner) {
				desc = `Go to ${winner.marker} won`;
			}
			// If this history item is the most recent move and the board is full, mark it
			else if (move === history.length - 1 && fullBoard) {
				desc = "Go to game over";
			}
			// Otherwise, add the move to the list along with the (x,y) position that was taken during the move
			else {
				// row is determined by rounding down the square position by the board width (3)
				// column is determined by the square position mods the board width (3)
				desc = `Go to move #${move} (` + Math.floor(step.squareForMove / 3) + "," + (step.squareForMove % 3) + ")";
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
